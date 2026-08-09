"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  anulareFactura,
  emitereFactura,
  FgoError,
  printFactura,
} from "@/lib/fgo/client";
import { buildFgoClient, buildFgoContinut } from "@/lib/fgo/build-invoice";
import { getResend, fromAddress, recipientFor } from "@/lib/resend/server";

type Result<T = void> =
  | ({ ok: true } & (T extends void ? object : { data: T }))
  | { ok: false; error: string };

async function assertAdmin(): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };
  return { ok: true };
}

/**
 * Emite factura pentru o comandă prin FGO. La succes:
 *  - salvează Numar/Serie/Link pe order
 *  - marchează fgo_invoice_status='issued'
 *  - trimite email către client cu link-ul PDF
 *  - loghează în order_events
 */
export async function generateInvoice(
  orderNumber: string,
): Promise<Result<{ number: string; series: string; link: string }>> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id, order_number, guest_email, shipping_cents, sgr_cents, discount_cents, excise_cents, billing, fgo_invoice_number, customers(email, name, phone), order_items(code_snapshot, name_snapshot, qty, unit_price_cents)",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (orderErr) {
    return { ok: false, error: `Eroare DB: ${orderErr.message}` };
  }
  if (!order) return { ok: false, error: "Comanda nu există." };
  if (order.fgo_invoice_number) {
    return {
      ok: false,
      error: `Factura există deja (${order.fgo_invoice_number}). Anuleaz-o dacă vrei să regenerezi.`,
    };
  }

  const billing = (order.billing ?? {}) as Record<string, unknown>;
  if (!billing || Object.keys(billing).length === 0) {
    return {
      ok: false,
      error: "Comanda nu are date de facturare — nu se poate emite factura.",
    };
  }

  const cust = Array.isArray(order.customers)
    ? order.customers[0]
    : order.customers;
  const customer = {
    email: cust?.email ?? order.guest_email ?? null,
    name: cust?.name ?? null,
    phone: cust?.phone ?? null,
  };

  const client = buildFgoClient(billing, customer);
  const continut = buildFgoContinut({
    items: order.order_items ?? [],
    order: {
      order_number: order.order_number,
      shipping_cents: order.shipping_cents,
      sgr_cents: order.sgr_cents ?? 0,
      discount_cents: order.discount_cents ?? 0,
      guest_email: order.guest_email,
    },
  });

  /* Mențiune accize — obligatorie ANAF pentru vin, inclusă deja în
     prețul afișat (nu se adaugă la total). O punem prominent în Explicații
     ca să apară pe factura FGO în secțiunea de observații. */
  const exciseRon = (order.excise_cents ?? 0) / 100;
  const exciseText =
    exciseRon > 0
      ? `DIN CARE ACCIZE: ${exciseRon.toFixed(2).replace(".", ",")} RON (cota 11 lei/hL vin liniștit, inclusă în preț)`
      : "";
  const explicatii = [
    exciseText,
    `Comandă online: ${order.order_number} · domeniul-locus.ro`,
  ]
    .filter(Boolean)
    .join("\n");

  let resp;
  try {
    resp = await emitereFactura({
      client,
      continut,
      idExtern: order.order_number,
      text: `Comanda #${order.order_number}`,
      explicatii: explicatii,
    });
  } catch (err) {
    const msg =
      err instanceof FgoError ? `FGO: ${err.message}` : String(err);
    await supabase.from("order_events").insert({
      order_id: order.id,
      type: "fgo_invoice_failed",
      payload: { error: msg },
    });
    return { ok: false, error: msg };
  }

  if (!resp.Success) {
    await supabase.from("order_events").insert({
      order_id: order.id,
      type: "fgo_invoice_failed",
      payload: { error: resp.Message },
    });
    return { ok: false, error: `FGO: ${resp.Message}` };
  }

  const numar = resp.Factura.Numar;
  const serie = resp.Factura.Serie;
  const link = resp.Factura.Link;

  await supabase
    .from("orders")
    .update({
      fgo_invoice_number: numar,
      fgo_invoice_series: serie,
      fgo_invoice_link: link,
      fgo_invoice_created_at: new Date().toISOString(),
      fgo_invoice_status: "issued",
    })
    .eq("id", order.id);

  await supabase.from("order_events").insert({
    order_id: order.id,
    type: "fgo_invoice_issued",
    payload: { numar, serie, link },
  });

  // Email cu link-ul facturii — fail silent, nu blocăm emiterea.
  if (customer.email && link) {
    try {
      const emailRes = await getResend().emails.send({
        from: fromAddress(),
        to: recipientFor(customer.email),
        subject: `Factura ${serie} ${numar} — Comanda ${order.order_number}`,
        html: buildInvoiceEmailHtml({
          customerName: customer.name,
          orderNumber: order.order_number,
          invoiceNumber: `${serie} ${numar}`,
          invoiceLink: link,
        }),
      });
      await supabase.from("order_events").insert({
        order_id: order.id,
        type: emailRes.error
          ? "fgo_invoice_email_failed"
          : "fgo_invoice_email_sent",
        payload: {
          to: customer.email,
          error: emailRes.error?.message,
        },
      });
    } catch (err) {
      console.error("[generateInvoice] email failed", err);
    }
  }

  revalidatePath(`/admin/comenzi/${orderNumber}`);
  return { ok: true, data: { number: numar, series: serie, link } };
}

export async function cancelInvoice(
  orderNumber: string,
): Promise<Result> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, fgo_invoice_number, fgo_invoice_series")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { ok: false, error: "Comanda nu există." };
  if (!order.fgo_invoice_number || !order.fgo_invoice_series) {
    return { ok: false, error: "Nu există factură FGO pentru comandă." };
  }

  try {
    const res = await anulareFactura({
      numar: order.fgo_invoice_number,
      serie: order.fgo_invoice_series,
    });
    if (!res.Success) return { ok: false, error: `FGO: ${res.Message}` };
  } catch (err) {
    const msg = err instanceof FgoError ? `FGO: ${err.message}` : String(err);
    return { ok: false, error: msg };
  }

  await supabase
    .from("orders")
    .update({ fgo_invoice_status: "cancelled" })
    .eq("id", order.id);
  await supabase.from("order_events").insert({
    order_id: order.id,
    type: "fgo_invoice_cancelled",
    payload: {
      numar: order.fgo_invoice_number,
      serie: order.fgo_invoice_series,
    },
  });

  revalidatePath(`/admin/comenzi/${orderNumber}`);
  return { ok: true };
}

/** Retrimite email cu link-ul facturii (util dacă a picat prima dată). */
export async function resendInvoiceEmail(
  orderNumber: string,
): Promise<Result> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, guest_email, fgo_invoice_number, fgo_invoice_series, fgo_invoice_link, customers(email, name)",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order) return { ok: false, error: "Comanda nu există." };
  if (!order.fgo_invoice_link) {
    return { ok: false, error: "Nu există link factură — emite întâi factura." };
  }

  const cust = Array.isArray(order.customers)
    ? order.customers[0]
    : order.customers;
  const to = cust?.email ?? order.guest_email;
  if (!to) return { ok: false, error: "Nu am email destinatar." };

  const res = await getResend().emails.send({
    from: fromAddress(),
    to: recipientFor(to),
    subject: `Factura ${order.fgo_invoice_series} ${order.fgo_invoice_number} — Comanda ${order.order_number}`,
    html: buildInvoiceEmailHtml({
      customerName: cust?.name ?? null,
      orderNumber: order.order_number,
      invoiceNumber: `${order.fgo_invoice_series} ${order.fgo_invoice_number}`,
      invoiceLink: order.fgo_invoice_link,
    }),
  });
  if (res.error) return { ok: false, error: res.error.message };

  await supabase.from("order_events").insert({
    order_id: order.id,
    type: "fgo_invoice_email_resent",
    payload: { to },
  });
  return { ok: true };
}

/* ─── Email template ─────────────────────────────────────── */

function buildInvoiceEmailHtml(args: {
  customerName: string | null;
  orderNumber: string;
  invoiceNumber: string;
  invoiceLink: string;
}): string {
  return `
<!doctype html>
<html lang="ro">
<body style="margin:0;padding:0;background:#EBE1DA;font-family:'IBM Plex Mono',ui-monospace,monospace;color:#1A1A1A;">
  <div style="max-width:520px;margin:40px auto;background:#F2EAE2;padding:40px 32px;">
    <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:500;margin:0 0 24px;">
      Domeniul Locus
    </div>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      ${args.customerName ? `Bună ${escapeHtml(args.customerName)},` : "Bună,"}
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      Factura pentru comanda <strong>#${escapeHtml(args.orderNumber)}</strong> a fost emisă.
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;">
      Nr. factură: <strong>${escapeHtml(args.invoiceNumber)}</strong>
    </p>
    <p style="margin:24px 0;text-align:center;">
      <a href="${escapeHtml(args.invoiceLink)}"
         style="display:inline-block;background:#1A1A1A;color:#EBE1DA;padding:14px 28px;text-decoration:none;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">
        Descarcă factura (PDF)
      </a>
    </p>
    <p style="margin:32px 0 0;font-size:11px;color:#A89D8D;line-height:1.6;">
      Conține sulfiți. Consumul excesiv de alcool dăunează sănătății.
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
