// HTML email templates — inline CSS only (most clients strip <style>).
// Brand: Italiana for headings (web-safe fallback Georgia), IBM Plex Mono
// for body labels (fallback Courier New). Palette: pamant/ink/vie.
//
// Width 560px is the safe email canvas for desktop + mobile.

import { formatRon } from "@/lib/wines";

const PAMANT = "#EBE1DA";
const INK = "#1A1A1A";
const INK_SOFT = "#4A3C2D";
const INK_MUTE = "#6E5E4B";
const VIE = "#3E4336";
const SURFACE = "#F2EAE2";
const LINE = "rgba(74,60,45,0.18)";

const SERIF = "'Italiana', Georgia, 'Times New Roman', serif";
const MONO = "'IBM Plex Mono', 'Courier New', Courier, monospace";

function shell(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Domeniul Locus</title>
</head>
<body style="margin:0;padding:0;background:${PAMANT};font-family:${MONO};color:${INK};">
  ${preheader ? `<div style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAMANT};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${PAMANT};">
          <tr>
            <td style="padding:0 0 24px 0;text-align:center;">
              <span style="font-family:${SERIF};font-size:32px;color:${INK};letter-spacing:-0.02em;">Domeniul Locus</span>
              <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-top:6px;">un loc · un timp · un vin</div>
            </td>
          </tr>
          <tr>
            <td style="background:${SURFACE};border:1px solid ${LINE};padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;text-align:center;font-family:${MONO};font-size:11px;color:${INK_MUTE};line-height:1.6;">
              SC ROMVINTEC SRL · Buciumeni, jud. Galați<br />
              <a href="mailto:contact@domeniul-locus.ro" style="color:${INK_SOFT};text-decoration:none;">contact@domeniul-locus.ro</a>
              · <a href="tel:+40752232912" style="color:${INK_SOFT};text-decoration:none;">0752 232 912</a>
              <br /><br />
              <span style="color:${INK_MUTE};font-size:10px;">
                18+ · Conține sulfiți · Consumul excesiv de alcool dăunează sănătății.
              </span>
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

// ─── Order confirmation (to customer) ────────────────────────────
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

export function orderConfirmationHtml(d: OrderConfirmationData): {
  subject: string;
  html: string;
} {
  const itemsRows = d.items
    .map(
      (it) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${MONO};font-size:13px;color:${INK_SOFT};">
            <div style="font-family:${SERIF};font-size:18px;color:${INK};letter-spacing:-0.005em;">${escapeHtml(it.name)}</div>
            <div style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${INK_MUTE};margin-top:2px;">${escapeHtml(it.code)} · cantitate ${it.qty}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${MONO};font-size:13px;color:${INK};text-align:right;white-space:nowrap;">
            ${escapeHtml(formatRon(it.unitPriceRon * it.qty))}
          </td>
        </tr>`,
    )
    .join("");

  const totalsRows = `
    <tr><td style="padding:6px 0;font-family:${MONO};font-size:12px;color:${INK_SOFT};">Subtotal</td><td style="padding:6px 0;font-family:${MONO};font-size:12px;color:${INK_SOFT};text-align:right;">${formatRon(d.subtotalRon)}</td></tr>
    <tr><td style="padding:6px 0;font-family:${MONO};font-size:12px;color:${INK_SOFT};">Transport</td><td style="padding:6px 0;font-family:${MONO};font-size:12px;color:${INK_SOFT};text-align:right;">${d.shippingRon === 0 ? "gratuit" : formatRon(d.shippingRon)}</td></tr>
    ${d.discountRon > 0 ? `<tr><td style="padding:6px 0;font-family:${MONO};font-size:12px;color:${INK_SOFT};">Voucher</td><td style="padding:6px 0;font-family:${MONO};font-size:12px;color:${INK_SOFT};text-align:right;">−${formatRon(d.discountRon)}</td></tr>` : ""}
    <tr><td style="padding:14px 0 6px 0;border-top:1px solid ${LINE};font-family:${SERIF};font-size:22px;color:${INK};">Total</td><td style="padding:14px 0 6px 0;border-top:1px solid ${LINE};font-family:${SERIF};font-size:22px;color:${INK};text-align:right;">${formatRon(d.totalRon)}</td></tr>`;

  const greeting = d.customerName
    ? `<span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">Mulțumim, ${escapeHtml(d.customerName)}.</span>`
    : `<span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">Mulțumim.</span>`;

  const shippingLine =
    d.shippingMethod === "ridicare"
      ? "Ridicare personală — te anunțăm prin SMS și email când e gata."
      : `Livrare prin curier${d.shippingAddress ? ` la ${escapeHtml(d.shippingAddress)}` : ""}, în 2–4 zile lucrătoare.`;

  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      comandă confirmată · ${escapeHtml(d.orderNumber)}
    </div>
    ${greeting}
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      Am primit comanda ta și plata. Mai jos ai detaliile.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
      ${itemsRows}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
      ${totalsRows}
    </table>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      <strong style="color:${INK};">Livrare</strong><br />
      ${shippingLine}
    </p>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:16px 0 0 0;">
      <strong style="color:${INK};">Plată</strong><br />
      ${escapeHtml(d.paymentMethod === "card-online" ? "Card online — încasată" : "La livrare (ramburs)")}
    </p>

    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:32px 0 0 0;">
      Pentru întrebări, scrie la
      <a href="mailto:contact@domeniul-locus.ro" style="color:${INK_SOFT};">contact@domeniul-locus.ro</a>.
      Vinul, ca și locul, are nevoie de timp.
    </p>`;

  return {
    subject: `Comanda ta · ${d.orderNumber}`,
    html: shell(
      content,
      `Mulțumim pentru comandă. ${d.orderNumber}, total ${formatRon(d.totalRon)}.`,
    ),
  };
}

// ─── Admin notification (to office@…) ────────────────────────────
export function adminOrderNotificationHtml(d: OrderConfirmationData & {
  customerEmail?: string | null;
  customerPhone?: string | null;
}): { subject: string; html: string } {
  const itemsList = d.items
    .map(
      (it) =>
        `<li style="margin-bottom:6px;">${escapeHtml(it.name)} <span style="color:${INK_MUTE};">(${escapeHtml(it.code)})</span> × ${it.qty} = ${formatRon(it.unitPriceRon * it.qty)}</li>`,
    )
    .join("");

  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${VIE};margin-bottom:14px;">
      comandă nouă
    </div>
    <span style="font-family:${SERIF};font-size:32px;color:${INK};">${escapeHtml(d.orderNumber)}</span>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;font-family:${MONO};font-size:13px;color:${INK_SOFT};">
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
      Comanda e marcată ca <strong style="color:${INK};">paid</strong> în Supabase. Următorul pas:
      Smartbill (factură + e-Factura ANAF) și Sameday (AWB) — încă manual.
    </p>`;

  return {
    subject: `🍷 Comandă nouă · ${d.orderNumber} · ${formatRon(d.totalRon)}`,
    html: shell(content, `${d.orderNumber} · ${formatRon(d.totalRon)}`),
  };
}

// ─── Shipped notification (to customer) ─────────────────────────
export type ShippedEmailData = {
  orderNumber: string;
  customerName?: string;
  awbNumber?: string | null;
  courierName?: string; // ex: "FanCourier"
  trackingUrl?: string; // opțional, dacă știm URL-ul de tracking
  shippingAddress?: string;
};

export function shippedNotificationHtml(d: ShippedEmailData): {
  subject: string;
  html: string;
} {
  const greeting = d.customerName
    ? `<span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">Coletul e pe drum, ${escapeHtml(d.customerName)}.</span>`
    : `<span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">Coletul e pe drum.</span>`;

  const awbBlock = d.awbNumber
    ? `
    <div style="margin-top:32px;padding:20px;background:${PAMANT};border:1px solid ${LINE};">
      <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:8px;">
        AWB${d.courierName ? ` · ${escapeHtml(d.courierName)}` : ""}
      </div>
      <div style="font-family:${MONO};font-size:20px;font-weight:500;color:${INK};letter-spacing:0.06em;">
        ${escapeHtml(d.awbNumber)}
      </div>
      ${
        d.trackingUrl
          ? `<p style="margin:14px 0 0 0;"><a href="${escapeHtml(d.trackingUrl)}" style="font-family:${MONO};font-size:12px;color:${VIE};text-decoration:underline;">Urmărește coletul →</a></p>`
          : ""
      }
    </div>`
    : "";

  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      comandă expediată · ${escapeHtml(d.orderNumber)}
    </div>
    ${greeting}
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      Am predat coletul curierului. Livrarea durează în general 2–4 zile
      lucrătoare${d.shippingAddress ? ` la <strong style="color:${INK};">${escapeHtml(d.shippingAddress)}</strong>` : ""}.
    </p>

    ${awbBlock}

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      Curierul te va contacta telefonic înainte de livrare. Dacă nu ești acasă,
      poți reprograma direct cu el.
    </p>
    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:20px 0 0 0;">
      Recomandăm să deschizi coletul în prezența curierului — sticlele sunt
      fragile, iar dacă găsești ceva stricat, marchezi rezervă pe AWB și
      ne scrii la
      <a href="mailto:contact@domeniul-locus.ro" style="color:${INK_SOFT};">contact@domeniul-locus.ro</a>.
    </p>`;

  return {
    subject: `Comanda ${d.orderNumber} · expediată`,
    html: shell(
      content,
      d.awbNumber
        ? `Coletul e pe drum. AWB ${d.awbNumber}.`
        : `Coletul e pe drum.`,
    ),
  };
}

// ─── Delivered notification (to customer) ────────────────────────
export type DeliveredEmailData = {
  orderNumber: string;
  customerName?: string;
};

export function deliveredNotificationHtml(d: DeliveredEmailData): {
  subject: string;
  html: string;
} {
  const greeting = d.customerName
    ? `<span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">Sper să-ți placă, ${escapeHtml(d.customerName)}.</span>`
    : `<span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">Sper să-ți placă.</span>`;

  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      comandă livrată · ${escapeHtml(d.orderNumber)}
    </div>
    ${greeting}
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      Coletul a ajuns. Deschide-l cu o urgență liniștită.
    </p>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      <strong style="color:${INK};">Cum să bei bine.</strong><br />
      Vinurile albe și rosé la 8–10 °C, roșurile la 14–16 °C. Decantează
      Fetească Neagră 20–30 de minute înainte de servit — merită timpul.
    </p>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:20px 0 0 0;">
      <strong style="color:${INK};">Ceva nu a mers?</strong><br />
      Ai 14 zile calendaristice pentru drept de retragere (OUG 34/2014).
      Sticlele deschise sau deteriorate după livrare nu intră în acest drept.
      Deschide o cerere din contul tău sau scrie-ne direct la
      <a href="mailto:contact@domeniul-locus.ro" style="color:${INK_SOFT};">contact@domeniul-locus.ro</a>.
    </p>

    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:32px 0 0 0;">
      Vinul, ca și locul, are nevoie de timp. Noroc.
    </p>`;

  return {
    subject: `Comanda ${d.orderNumber} · livrată`,
    html: shell(content, "Coletul a ajuns. Deschide-l cu o urgență liniștită."),
  };
}

// ─── Refund confirmation (to customer) ──────────────────────────
export type RefundEmailData = {
  orderNumber: string;
  customerName?: string;
  refundedRon: number;
  method: "stripe" | "manual";
  manualChannel?: "transfer" | "cash" | "altul" | null;
  isPartial?: boolean; // dacă e refund parțial
};

export function refundConfirmationHtml(d: RefundEmailData): {
  subject: string;
  html: string;
} {
  const greeting = d.customerName
    ? `<span style="font-family:${SERIF};font-size:32px;color:${INK};letter-spacing:-0.015em;">${d.isPartial ? "Rambursare parțială" : "Rambursare confirmată"}, ${escapeHtml(d.customerName)}.</span>`
    : `<span style="font-family:${SERIF};font-size:32px;color:${INK};letter-spacing:-0.015em;">${d.isPartial ? "Rambursare parțială" : "Rambursare confirmată"}.</span>`;

  const methodLabel =
    d.method === "stripe"
      ? "Se întoarce pe cardul cu care ai plătit. Ajunge în 3–7 zile lucrătoare (depinde de banca ta)."
      : d.manualChannel === "transfer"
        ? "Transfer bancar direct în contul tău. Confirmarea a plecat din banca noastră astăzi."
        : d.manualChannel === "cash"
          ? "Rambursat în numerar."
          : "Rambursare manuală procesată.";

  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      rambursare · ${escapeHtml(d.orderNumber)}
    </div>
    ${greeting}
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      Am procesat rambursarea pentru comanda ta.
    </p>

    <div style="margin-top:32px;padding:24px;background:${PAMANT};border:1px solid ${LINE};text-align:center;">
      <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:8px;">
        Sumă rambursată
      </div>
      <div style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.01em;">
        ${formatRon(d.refundedRon)}
      </div>
    </div>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      <strong style="color:${INK};">Metodă</strong><br />
      ${methodLabel}
    </p>

    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:32px 0 0 0;">
      Dacă nu vezi suma pe extras după termenul menționat, scrie la
      <a href="mailto:contact@domeniul-locus.ro" style="color:${INK_SOFT};">contact@domeniul-locus.ro</a>
      cu numărul comenzii — verificăm imediat.
    </p>`;

  return {
    subject: `Rambursare ${d.orderNumber} · ${formatRon(d.refundedRon)}`,
    html: shell(
      content,
      `${formatRon(d.refundedRon)} rambursat pentru comanda ${d.orderNumber}.`,
    ),
  };
}

// ─── Return status update (to customer) ─────────────────────────
export type ReturnStatusEmailData = {
  returnNumber: string;
  orderNumber?: string | null;
  customerName?: string;
  status: "approved" | "in_transit" | "completed" | "rejected";
  adminMessage?: string; // opțional — mesaj personalizat de la admin
};

export function returnStatusUpdateHtml(d: ReturnStatusEmailData): {
  subject: string;
  html: string;
} {
  const statusMeta: Record<
    ReturnStatusEmailData["status"],
    { headline: string; subject: string; body: string }
  > = {
    approved: {
      headline: "Cererea de retur e aprobată.",
      subject: `Retur ${d.returnNumber} · aprobat`,
      body: `Am aprobat cererea ta de retur. Următorul pas: trimiți coletul înapoi la Buciumeni. Îți vom trimite instrucțiuni de expediere separat sau te contactăm telefonic în următoarele 24h.`,
    },
    in_transit: {
      headline: "Coletul de retur e pe drum.",
      subject: `Retur ${d.returnNumber} · în transport`,
      body: `Am marcat coletul de retur ca fiind în transport. Așteptăm să ajungă la noi și apoi te anunțăm când e verificat.`,
    },
    completed: {
      headline: "Returul e finalizat.",
      subject: `Retur ${d.returnNumber} · finalizat`,
      body: `Am procesat returul complet. Dacă ai ales rambursare, banii au plecat spre tine (vezi emailul separat cu detaliile). Dacă ai ales înlocuire sau voucher, primești confirmarea corespunzătoare.`,
    },
    rejected: {
      headline: "Cererea de retur nu a fost aprobată.",
      subject: `Retur ${d.returnNumber} · respins`,
      body: `După verificare, cererea ta nu a putut fi aprobată. Motivul e adesea legat de termenul de 14 zile de la livrare (OUG 34/2014) sau de starea produsului. Dacă vrei mai multe detalii sau contești decizia, scrie-ne la contact@domeniul-locus.ro.`,
    },
  };

  const meta = statusMeta[d.status];
  const greeting = d.customerName
    ? `<span style="font-family:${SERIF};font-size:32px;color:${INK};letter-spacing:-0.015em;">${meta.headline}</span>`
    : `<span style="font-family:${SERIF};font-size:32px;color:${INK};letter-spacing:-0.015em;">${meta.headline}</span>`;

  const adminBlock = d.adminMessage
    ? `
    <div style="margin-top:24px;padding:16px 20px;border-left:2px solid ${VIE};background:${PAMANT};">
      <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:6px;">
        mesaj din partea noastră
      </div>
      <p style="font-family:${MONO};font-size:13px;line-height:1.7;color:${INK};margin:0;">
        ${escapeHtml(d.adminMessage)}
      </p>
    </div>`
    : "";

  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      retur · ${escapeHtml(d.returnNumber)}${d.orderNumber ? ` · comandă ${escapeHtml(d.orderNumber)}` : ""}
    </div>
    ${greeting}
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      ${meta.body}
    </p>

    ${adminBlock}

    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      Vezi statusul în orice moment în contul tău sau răspunde la acest email
      dacă ai întrebări.
    </p>`;

  return {
    subject: meta.subject,
    html: shell(content, meta.headline),
  };
}

// ─── Newsletter welcome ───────────────────────────────────────────
export function newsletterWelcomeHtml(): { subject: string; html: string } {
  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      bun venit
    </div>
    <span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">Locul, în cuvinte.</span>
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      Mulțumim că te alături. De aici încolo, vei primi notițe rare din vie și
      pivniță — recolte, ediții limitate înainte să apară pe site, invitații
      la degustări la sediul din Buciumeni.
    </p>
    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      Trimitem doar când chiar avem ce povesti. Te poți dezabona oricând —
      orice email va avea un link discret la subsol.
    </p>
    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      Între timp, vinurile sunt aici:
      <a href="https://domeniul-locus.ro/shop" style="color:${INK};text-decoration:underline;">domeniul-locus.ro/shop</a>
    </p>`;

  return {
    subject: "Bun venit la Domeniul Locus",
    html: shell(content, "Notițe rare din vie și pivniță."),
  };
}
