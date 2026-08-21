// HTML email templates — DESIGN + STRUCTURĂ.
// Textele editabile trăiesc în DB (tabel email_templates) + defaults în
// lib/email/schema.ts. Aici doar assemble-uim HTML-ul din blocks.
//
// Rulează server-side (nu importa în client components).
// Brand: Italiana pentru titluri (fallback Georgia), IBM Plex Mono pentru
// body (fallback Courier New). Paleta pamant/ink/vie.
// Canvas 560px = safe pt desktop + mobile.

import { formatRon } from "@/lib/wines";
import { interpolate } from "@/lib/email/schema";
import { getSiteUrl } from "@/lib/site";

/* Imaginile din email au nevoie de URL absolut — clientul de mail nu are
   noțiunea de „origine". Vine din NEXT_PUBLIC_SITE_URL, aceeași sursă ca
   linkurile din feed-uri și redirect-urile Stripe. */
const SITE = getSiteUrl();

/* Paleta e cea din `supabase/email-templates/magic-link.html`. Cele două
   familii de emailuri — cele trimise de Supabase la autentificare și cele
   trimise de noi prin Resend — arătau ca din proiecte diferite; acum
   folosesc aceleași valori. Dacă schimbi ceva aici, schimbă și acolo. */
const PAMANT = "#f0ede7"; // fundalul paginii, în spatele cardului
const SURFACE = "#faf9f6"; // cardul propriu-zis
const INK = "#1a1a1a";
const INK_SOFT = "#4a3c2d";
const INK_MUTE = "#6e5e4b";
const GOLD = "#8b7841"; // tagline sub logo + linkuri
const LEGAL = "#8a7c68"; // mențiunile de sub card
const VIE = GOLD; // linkurile erau verzi; în design-ul nou sunt aurii
const LINE = "rgba(74,60,45,0.14)";

const SERIF = "'Italiana', Georgia, 'Times New Roman', serif";
const MONO = "'IBM Plex Mono', 'Courier New', Courier, monospace";

/* ─── Cărămizile design-ului ────────────────────────────────────
   Emailul e „listă de vinuri tipărită": separăm cu linii de un pixel,
   nu cu chenare imbricate. Fiecare bucată de mai jos e o mișcare din
   partitura asta, ca să nu se rescrie stilul în fiecare șablon. */

/** Linie orizontală subțire. `<div>` cu înălțime 1px — `<hr>` e imprevizibil în Outlook. */
export function rule(marginTop = 0): string {
  return `<div style="height:1px;background:${LINE};font-size:0;line-height:0;${marginTop ? `margin-top:${marginTop}px;` : ""}">&nbsp;</div>`;
}

/** Linie întreruptă la mijloc de un asterisc auriu. Marchează trecerea de la mesaj la date. */
export function ornament(): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="height:1px;background:${LINE};font-size:0;line-height:0;">&nbsp;</td>
        <td width="34" align="center" style="width:34px;font-family:${MONO};font-size:9px;color:${GOLD};line-height:1;">&#10035;</td>
        <td style="height:1px;background:${LINE};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>`;
}

/**
 * Datul important — număr de comandă, AWB, sumă, cod — tratat ca specimen
 * tipografic: etichetă minusculă deasupra, valoarea mare în serif cu
 * spațiere largă. E ancora vizuală a fiecărui email.
 */
export function specimen(
  label: string,
  value: string,
  opts: { size?: number; tracking?: string; note?: string } = {},
): string {
  const size = opts.size ?? 29;
  const tracking = opts.tracking ?? "0.16em";
  return `
    <div style="text-align:center;">
      <div style="font-family:${MONO};font-size:8.5px;letter-spacing:0.32em;text-transform:uppercase;color:${INK_MUTE};">${escapeHtml(label)}</div>
      <div style="font-family:${SERIF};font-size:${size}px;letter-spacing:${tracking};color:${INK};padding-top:9px;">${escapeHtml(value)}</div>
      ${opts.note ? `<div style="font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${GOLD};padding-top:14px;">${escapeHtml(opts.note)}</div>` : ""}
    </div>`;
}

/** Buton negru, construit ca tabel — singura formă pe care o respectă Outlook. */
export function button(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center">
      <tr><td align="center" bgcolor="${INK}" style="background:${INK};">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:15px 38px;font-family:${MONO};font-size:9.5px;letter-spacing:0.26em;text-transform:uppercase;color:${SURFACE};text-decoration:none;">${escapeHtml(label)}</a>
      </td></tr>
    </table>`;
}

/** Etichetă auriuă de secțiune, mică și răsfirată. */
export function sectionLabel(text: string): string {
  return `<div style="font-family:${MONO};font-size:8.5px;letter-spacing:0.32em;text-transform:uppercase;color:${GOLD};">${escapeHtml(text)}</div>`;
}

/** Paragraf de corp. */
export function para(html: string, size = 11): string {
  return `<div style="font-family:${MONO};font-size:${size}px;line-height:1.95;color:${INK_SOFT};">${html}</div>`;
}

/**
 * Un rând din lista de produse, cu puncte de conducere între nume și preț
 * — ca într-o carte de vinuri. Punctele sunt `border-bottom` pe celula
 * din mijloc; e tehnica ce ține în toate clienții de email.
 */
export function priceRow(name: string, sub: string, amount: string, last = false): string {
  return `
    <tr>
      <td style="font-family:${SERIF};font-size:19px;color:${INK};white-space:nowrap;padding-bottom:2px;">${escapeHtml(name)}</td>
      <td style="border-bottom:1px dotted rgba(74,60,45,0.34);font-size:0;line-height:0;padding:0 8px 4px 8px;">&nbsp;</td>
      <td style="font-family:${MONO};font-size:12px;color:${INK};text-align:right;white-space:nowrap;padding-bottom:2px;">${escapeHtml(amount)}</td>
    </tr>
    <tr><td colspan="3" style="font-family:${MONO};font-size:8.5px;letter-spacing:0.24em;text-transform:uppercase;color:${INK_MUTE};padding:5px 0 ${last ? "0" : "24"}px 0;">${escapeHtml(sub)}</td></tr>`;
}

/** Două coloane egale — pentru Livrare / Plată. */
export function twoColumns(
  a: { label: string; body: string },
  b2: { label: string; body: string },
): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" valign="top" style="padding-right:18px;">
          ${sectionLabel(a.label)}
          <div style="font-family:${MONO};font-size:11px;line-height:1.95;color:${INK_SOFT};padding-top:10px;">${a.body}</div>
        </td>
        <td width="50%" valign="top" style="padding-left:18px;">
          ${sectionLabel(b2.label)}
          <div style="font-family:${MONO};font-size:11px;line-height:1.95;color:${INK_SOFT};padding-top:10px;">${b2.body}</div>
        </td>
      </tr>
    </table>`;
}

/**
 * Cadrul comun. Antet de hârtie cu antet (marcaj la stânga, logo la
 * dreapta), linie, titlu, conținut, apoi semnătura.
 */
export function shell(
  content: string,
  preheader = "",
  head: { eyebrow?: string; title?: string } = {},
): string {
  const titleBlock =
    head.title || head.eyebrow
      ? `
          <tr>
            <td style="padding:40px 46px 0 46px;">
              ${head.eyebrow ? `<div style="font-family:${MONO};font-size:9px;letter-spacing:0.32em;text-transform:uppercase;color:${GOLD};">${escapeHtml(head.eyebrow)}</div>` : ""}
              ${head.title ? `<div style="font-family:${SERIF};font-size:44px;line-height:1.08;color:${INK};letter-spacing:-0.01em;padding-top:${head.eyebrow ? "16px" : "0"};">${escapeHtml(head.title)}</div>` : ""}
            </td>
          </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Domeniul Locus</title>
</head>
<body style="margin:0;padding:0;background:${PAMANT};font-family:${MONO};color:${INK};">
  ${preheader ? `<div style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAMANT};padding:44px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${SURFACE};border:1px solid ${LINE};">

          <tr>
            <td style="padding:38px 46px 0 46px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="font-family:${MONO};font-size:8.5px;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};line-height:1.9;">
                    Domeniul Locus<br /><span style="color:${INK_MUTE};">Buciumeni &middot; Galați</span>
                  </td>
                  <td valign="middle" align="right" width="72" style="width:72px;">
                    <img src="${SITE}/brand/logo-locus.png" width="72" alt="Domeniul Locus"
                         style="display:block;width:72px;height:auto;border:0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="padding:26px 46px 0 46px;">${rule()}</td></tr>

          ${titleBlock}

          <tr>
            <td style="padding:${titleBlock ? "22px" : "40px"} 46px 0 46px;">
              ${content}
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:44px 46px 0 46px;">
              ${rule()}
              <div style="font-family:${SERIF};font-size:11px;letter-spacing:0.34em;text-transform:uppercase;color:${GOLD};padding-top:24px;">un loc &middot; un timp &middot; un vin</div>
              <div style="font-family:${MONO};font-size:8.5px;letter-spacing:0.16em;text-transform:uppercase;color:${INK_MUTE};padding-top:14px;line-height:2;">
                <a href="mailto:office@domeniul-locus.ro" style="color:${INK_MUTE};text-decoration:none;">office@domeniul-locus.ro</a>
                &nbsp;&middot;&nbsp;
                <a href="tel:+40752232912" style="color:${INK_MUTE};text-decoration:none;">0752 232 912</a>
              </div>
            </td>
          </tr>
          <tr><td style="padding:0 46px 46px 46px;"></td></tr>
        </table>

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:20px 20px 0 20px;font-family:${MONO};font-size:8.5px;line-height:1.9;letter-spacing:0.1em;color:${LEGAL};">
              SC ROMVINTEC SRL &middot; 18+ &middot; Conține sulfiți<br />
              Consumul excesiv de alcool dăunează sănătății.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Convertește un text (potențial multi-linie) în HTML: escape + \n→<br />.
// Nu escape pe {{}} — interpolarea rulează înainte, iar rezultatul e text pur.
function textToHtml(s: string): string {
  return escapeHtml(s).replaceAll("\n", "<br />");
}

// Interpolează blocul cu variabilele contextului.
function b(
  blocks: Record<string, string>,
  key: string,
  vars: Record<string, string | number | undefined | null>,
): string {
  const raw = blocks[key] ?? "";
  return interpolate(raw, vars);
}

// Assemble output type — content + preheader (folosite de shell()).
/**
 * Un email asamblat. `eyebrow` și `title` stau separat de `content`
 * fiindcă antetul e un rând cu două coloane — text la stânga, logo la
 * dreapta — construit de `shell()`. Dacă le-am lăsa în conținut, logo-ul
 * n-ar avea lângă ce să se așeze.
 */
type Assembled = {
  content: string;
  preheader: string;
  eyebrow: string;
  title: string;
};

// ─── Data types (structured content, non-editable) ──────────────

export type OrderEmailItem = {
  name: string;
  code: string;
  qty: number;
  unitPriceRon: number;
};

export type OrderConfirmationData = {
  orderNumber: string;
  customerName?: string;
  items: OrderEmailItem[];
  subtotalRon: number;
  shippingRon: number;
  discountRon: number;
  totalRon: number;
  shippingMethod: "curier" | "ridicare";
  shippingAddress?: string;
  paymentMethod: string;
};

export type ShippedEmailData = {
  orderNumber: string;
  customerName?: string;
  awbNumber?: string | null;
  courierName?: string;
  trackingUrl?: string;
  shippingAddress?: string;
};

export type DeliveredEmailData = {
  orderNumber: string;
  customerName?: string;
};

export type RefundEmailData = {
  orderNumber: string;
  customerName?: string;
  refundedRon: number;
  method: "stripe" | "manual";
  manualChannel?: "transfer" | "cash" | "altul" | null;
  isPartial?: boolean;
};

export type ReturnStatusEmailData = {
  returnNumber: string;
  orderNumber?: string | null;
  customerName?: string;
  status: "approved" | "in_transit" | "completed" | "rejected";
  adminMessage?: string;
};

// ─── Order confirmation ─────────────────────────────────────────

export function assembleOrderConfirmation(
  blocks: Record<string, string>,
  d: OrderConfirmationData,
): Assembled {
  const vars = d as unknown as Record<string, string | number | undefined>;

  const itemsRows = d.items
    .map((it, i) =>
      priceRow(
        it.name,
        `${it.code} · ${it.qty} ${it.qty === 1 ? "sticlă" : "sticle"}`,
        formatRon(it.unitPriceRon * it.qty),
        i === d.items.length - 1,
      ),
    )
    .join("");

  const totalLine = (label: string, value: string) => `
    <tr>
      <td style="font-family:${MONO};font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:${INK_MUTE};padding:5px 0;">${escapeHtml(label)}</td>
      <td style="font-family:${MONO};font-size:11.5px;color:${INK_SOFT};text-align:right;padding:5px 0;">${escapeHtml(value)}</td>
    </tr>`;

  const eyebrowText = b(blocks, "eyebrow", vars);
  const greetingText = d.customerName
    ? b(blocks, "greeting", vars)
    : b(blocks, "greeting_guest", vars);
  const introText = b(blocks, "intro", vars);
  const shippingText =
    d.shippingMethod === "ridicare"
      ? b(blocks, "shipping_ridicare", vars)
      : b(blocks, "shipping_curier", vars);
  const paymentText =
    d.paymentMethod === "card-online"
      ? b(blocks, "payment_card", vars)
      : b(blocks, "payment_cash", vars);

  const content = `
    ${para(textToHtml(introText))}

    <div style="margin-top:34px;">${ornament()}</div>

    <div style="margin-top:30px;">
      ${specimen("Comanda", d.orderNumber)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:38px;">
      ${itemsRows}
    </table>

    <div style="margin-top:30px;">${rule()}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${totalLine("Subtotal", formatRon(d.subtotalRon))}
      ${totalLine("Transport", d.shippingRon === 0 ? "gratuit" : formatRon(d.shippingRon))}
      ${d.discountRon > 0 ? totalLine("Voucher", `−${formatRon(d.discountRon)}`) : ""}
      <tr>
        <td style="font-family:${MONO};font-size:9px;letter-spacing:0.32em;text-transform:uppercase;color:${GOLD};padding:20px 0 0 0;border-top:1px solid ${LINE};">Total</td>
        <td style="font-family:${SERIF};font-size:27px;color:${INK};text-align:right;padding:14px 0 0 0;border-top:1px solid ${LINE};">${escapeHtml(formatRon(d.totalRon))}</td>
      </tr>
    </table>

    <div style="margin-top:36px;">${rule()}</div>
    <div style="margin-top:22px;">
      ${twoColumns(
        { label: b(blocks, "shipping_heading", vars), body: textToHtml(shippingText) },
        { label: b(blocks, "payment_heading", vars), body: textToHtml(paymentText) },
      )}
    </div>

    <div style="font-family:${MONO};font-size:10px;line-height:1.9;color:${INK_MUTE};margin-top:32px;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </div>`;

  return {
    content,
    eyebrow: eyebrowText,
    title: greetingText,
    preheader: `${greetingText} ${d.orderNumber}, total ${formatRon(d.totalRon)}.`,
  };
}
// ─── Shipped ────────────────────────────────────────────────────

export function assembleShipped(
  blocks: Record<string, string>,
  d: ShippedEmailData,
): Assembled {
  const vars = d as unknown as Record<string, string | number | undefined>;

  const greetingText = d.customerName
    ? b(blocks, "greeting", vars)
    : b(blocks, "greeting_guest", vars);
  const introText = d.shippingAddress
    ? b(blocks, "intro", vars)
    : b(blocks, "intro_no_address", vars);

  /* AWB-ul e datul pe care omul îl caută — îl tratăm ca specimen, nu
     îngropat într-o casetă. Butonul apare doar dacă avem link real. */
  const awbBlock = d.awbNumber
    ? `
    <div style="margin-top:34px;">${ornament()}</div>
    <div style="margin-top:30px;">
      ${specimen(`AWB${d.courierName ? ` · ${d.courierName}` : ""}`, d.awbNumber)}
    </div>
    ${d.trackingUrl ? `<div style="margin-top:26px;">${button(d.trackingUrl, "Urmărește coletul")}</div>` : ""}`
    : "";

  const content = `
    ${para(textToHtml(introText))}

    ${awbBlock}

    <div style="margin-top:${awbBlock ? "40" : "34"}px;">${rule()}</div>
    <div style="margin-top:22px;">
      ${sectionLabel("La primire")}
      <div style="font-family:${MONO};font-size:11px;line-height:1.95;color:${INK_SOFT};padding-top:10px;">
        ${textToHtml(b(blocks, "advice", vars))}
      </div>
    </div>

    <div style="font-family:${MONO};font-size:10px;line-height:1.9;color:${INK_MUTE};margin-top:26px;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </div>`;

  return {
    content,
    eyebrow: b(blocks, "eyebrow", vars),
    title: greetingText,
    preheader: d.awbNumber
      ? `Coletul e pe drum. AWB ${d.awbNumber}.`
      : `Coletul e pe drum.`,
  };
}

// ─── Delivered ──────────────────────────────────────────────────

export function assembleDelivered(
  blocks: Record<string, string>,
  d: DeliveredEmailData,
): Assembled {
  const vars = d as unknown as Record<string, string | number | undefined>;

  const greetingText = d.customerName
    ? b(blocks, "greeting", vars)
    : b(blocks, "greeting_guest", vars);

  /* Singurul email fără specimen: n-are niciun număr de arătat. În locul
     lui, ornamentul deschide cele două sfaturi, servire și retur. */
  const content = `
    ${para(textToHtml(b(blocks, "intro", vars)))}

    <div style="margin-top:36px;">${ornament()}</div>

    <div style="margin-top:30px;">
      ${twoColumns(
        {
          label: b(blocks, "serving_heading", vars),
          body: textToHtml(b(blocks, "serving_body", vars)),
        },
        {
          label: b(blocks, "return_heading", vars),
          body: textToHtml(b(blocks, "return_body", vars)),
        },
      )}
    </div>

    <div style="margin-top:34px;">${rule()}</div>
    <div style="font-family:${MONO};font-size:10px;line-height:1.9;color:${INK_MUTE};margin-top:22px;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </div>`;

  return {
    content,
    eyebrow: b(blocks, "eyebrow", vars),
    title: greetingText,
    preheader: "Coletul a ajuns. Deschide-l cu o urgență liniștită.",
  };
}

// ─── Refund confirmation ────────────────────────────────────────

export function assembleRefundConfirmation(
  blocks: Record<string, string>,
  d: RefundEmailData,
): Assembled {
  const vars = d as unknown as Record<string, string | number | undefined>;

  let greetingKey: string;
  if (d.isPartial) {
    greetingKey = d.customerName ? "greeting_partial" : "greeting_partial_guest";
  } else {
    greetingKey = d.customerName ? "greeting_full" : "greeting_full_guest";
  }
  const greetingText = b(blocks, greetingKey, vars);

  const methodText =
    d.method === "stripe"
      ? b(blocks, "method_stripe", vars)
      : d.manualChannel === "transfer"
        ? b(blocks, "method_transfer", vars)
        : d.manualChannel === "cash"
          ? b(blocks, "method_cash", vars)
          : b(blocks, "method_other", vars);

  const content = `
    ${para(textToHtml(b(blocks, "intro", vars)))}

    <div style="margin-top:34px;">${ornament()}</div>

    <div style="margin-top:30px;">
      ${specimen(b(blocks, "amount_label", vars), formatRon(d.refundedRon), {
        size: 36,
        tracking: "-0.01em",
      })}
    </div>

    <div style="margin-top:38px;">${rule()}</div>
    <div style="margin-top:22px;">
      ${sectionLabel(b(blocks, "method_heading", vars))}
      <div style="font-family:${MONO};font-size:11px;line-height:1.95;color:${INK_SOFT};padding-top:10px;">
        ${textToHtml(methodText)}
      </div>
    </div>

    <div style="font-family:${MONO};font-size:10px;line-height:1.9;color:${INK_MUTE};margin-top:28px;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </div>`;

  return {
    content,
    eyebrow: b(blocks, "eyebrow", vars),
    title: greetingText,
    preheader: `${formatRon(d.refundedRon)} rambursat pentru comanda ${d.orderNumber}.`,
  };
}

// ─── Return status update ───────────────────────────────────────

export function assembleReturnStatus(
  blocks: Record<string, string>,
  d: ReturnStatusEmailData,
): Assembled {
  const vars = d as unknown as Record<string, string | number | undefined>;

  const headline = b(blocks, `${d.status}_headline`, vars);
  const body = b(blocks, `${d.status}_body`, vars);

  const eyebrow = d.orderNumber
    ? b(blocks, "eyebrow_with_order", vars)
    : b(blocks, "eyebrow_no_order", vars);

  /* Mesajul scris de noi rămâne singurul bloc cu fundal din tot design-ul:
     e vocea unui om, nu date, și merită să se distingă de restul. */
  const adminBlock = d.adminMessage
    ? `
    <div style="margin-top:32px;padding:20px 22px;border-left:2px solid ${GOLD};background:${PAMANT};">
      <div style="font-family:${MONO};font-size:8.5px;letter-spacing:0.32em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:10px;">
        mesaj din partea noastră
      </div>
      <div style="font-family:${MONO};font-size:11.5px;line-height:1.9;color:${INK};">
        ${escapeHtml(d.adminMessage)}
      </div>
    </div>`
    : "";

  const content = `
    ${para(textToHtml(body))}

    <div style="margin-top:34px;">${ornament()}</div>

    <div style="margin-top:30px;">
      ${specimen("Retur", d.returnNumber)}
    </div>

    ${adminBlock}

    <div style="margin-top:34px;">${rule()}</div>
    <div style="font-family:${MONO};font-size:10px;line-height:1.9;color:${INK_MUTE};margin-top:22px;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </div>`;

  return { content, eyebrow, title: headline, preheader: headline };
}

// ─── Newsletter welcome ────────────────────────────────────────

export function assembleNewsletterWelcome(
  blocks: Record<string, string>,
  vars: Record<string, string | number | undefined>,
): Assembled {
  /* Codul apare doar dacă expeditorul a găsit un cupon activ. Un cod pe
     care checkout-ul l-ar refuza e mai rău decât niciun cod. */
  const code = String(vars.couponCode ?? "").trim();

  /* Când există cod, el e eroul emailului — specimen mare, cu tracking
     larg, urmat de buton. Fără cod, rămâne doar textul. */
  const couponBlock = code
    ? `
    <div style="margin-top:34px;">${ornament()}</div>
    <div style="margin-top:32px;">
      ${specimen(b(blocks, "coupon_label", vars), code, {
        size: 42,
        tracking: "0.24em",
        note: b(blocks, "coupon_note", vars),
      })}
    </div>
    <div style="margin-top:30px;">${button(`${SITE}/shop`, "Vezi vinurile")}</div>`
    : "";

  const content = `
    ${para(textToHtml(b(blocks, "para_1", vars)))}

    ${couponBlock}

    <div style="margin-top:${code ? "40" : "32"}px;">${rule()}</div>
    <div style="font-family:${MONO};font-size:10.5px;line-height:1.95;color:${INK_MUTE};margin-top:22px;">
      ${textToHtml(b(blocks, "para_2", vars))}
    </div>
    <div style="font-family:${MONO};font-size:10.5px;line-height:1.95;color:${INK_MUTE};margin-top:16px;">
      ${textToHtml(b(blocks, "para_3", vars))}
    </div>`;

  return {
    content,
    eyebrow: b(blocks, "eyebrow", vars),
    title: b(blocks, "greeting", vars),
    preheader: "Notițe rare din vie și pivniță.",
  };
}

// ─── Admin order notification (STAYS HARDCODED — nu e editabil) ─
// Email intern pentru admin (tine). Nu are sens să fie editabil din UI
// deoarece e o notificare tehnică, nu comunicare cu clientul.

export function adminOrderNotificationHtml(
  d: OrderConfirmationData & {
    customerEmail?: string | null;
    customerPhone?: string | null;
  },
): { subject: string; html: string } {
  const itemsList = d.items
    .map(
      (it) =>
        `<li style="margin-bottom:6px;">${escapeHtml(it.name)} <span style="color:${INK_MUTE};">(${escapeHtml(it.code)})</span> × ${it.qty} = ${formatRon(it.unitPriceRon * it.qty)}</li>`,
    )
    .join("");

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${MONO};font-size:13px;color:${INK_SOFT};">
      <tr><td style="padding:6px 0;color:${INK_MUTE};text-transform:uppercase;letter-spacing:0.16em;font-size:10px;">Total</td><td style="padding:6px 0;text-align:right;color:${INK};font-family:${SERIF};font-size:18px;">${formatRon(d.totalRon)}</td></tr>
      <tr><td style="padding:6px 0;color:${INK_MUTE};text-transform:uppercase;letter-spacing:0.16em;font-size:10px;">Plată</td><td style="padding:6px 0;text-align:right;">${escapeHtml(d.paymentMethod)}</td></tr>
      <tr><td style="padding:6px 0;color:${INK_MUTE};text-transform:uppercase;letter-spacing:0.16em;font-size:10px;">Livrare</td><td style="padding:6px 0;text-align:right;">${escapeHtml(d.shippingMethod)}${d.shippingAddress ? " — " + escapeHtml(d.shippingAddress) : ""}</td></tr>
      ${d.customerEmail ? `<tr><td style="padding:6px 0;color:${INK_MUTE};text-transform:uppercase;letter-spacing:0.16em;font-size:10px;">Email</td><td style="padding:6px 0;text-align:right;"><a href="mailto:${escapeHtml(d.customerEmail)}" style="color:${INK_SOFT};">${escapeHtml(d.customerEmail)}</a></td></tr>` : ""}
      ${d.customerPhone ? `<tr><td style="padding:6px 0;color:${INK_MUTE};text-transform:uppercase;letter-spacing:0.16em;font-size:10px;">Telefon</td><td style="padding:6px 0;text-align:right;"><a href="tel:${escapeHtml(d.customerPhone)}" style="color:${INK_SOFT};">${escapeHtml(d.customerPhone)}</a></td></tr>` : ""}
    </table>

    <div style="margin-top:24px;padding-top:24px;border-top:1px solid ${LINE};">
      <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:10px;">Articole</div>
      <ul style="font-family:${MONO};font-size:13px;line-height:1.8;color:${INK_SOFT};margin:0;padding-left:20px;">
        ${itemsList}
      </ul>
    </div>

    <p style="font-family:${MONO};font-size:11px;line-height:1.6;color:${INK_MUTE};margin:32px 0 0 0;">
      Comanda e marcată ca <strong style="color:${INK};">paid</strong> în Supabase.
      Următorul pas: FGO (factură) și FanCourier (AWB) — încă manual.
    </p>`;

  return {
    subject: `🍷 Comandă nouă · ${d.orderNumber} · ${formatRon(d.totalRon)}`,
    html: shell(content, `${d.orderNumber} · ${formatRon(d.totalRon)}`, {
      eyebrow: "comandă nouă",
      title: d.orderNumber,
    }),
  };
}
