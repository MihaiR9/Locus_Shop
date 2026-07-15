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

const PAMANT = "#EBE1DA";
const INK = "#1A1A1A";
const INK_SOFT = "#4A3C2D";
const INK_MUTE = "#6E5E4B";
const VIE = "#3E4336";
const SURFACE = "#F2EAE2";
const LINE = "rgba(74,60,45,0.18)";

const SERIF = "'Italiana', Georgia, 'Times New Roman', serif";
const MONO = "'IBM Plex Mono', 'Courier New', Courier, monospace";

export function shell(content: string, preheader = ""): string {
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
type Assembled = { content: string; preheader: string };

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

  const eyebrowText = b(blocks, "eyebrow", vars);
  const greetingText = d.customerName
    ? b(blocks, "greeting", vars)
    : b(blocks, "greeting_guest", vars);
  const introText = b(blocks, "intro", vars);
  const shippingHeadingText = b(blocks, "shipping_heading", vars);
  const shippingText =
    d.shippingMethod === "ridicare"
      ? b(blocks, "shipping_ridicare", vars)
      : b(blocks, "shipping_curier", vars);
  const paymentHeadingText = b(blocks, "payment_heading", vars);
  const paymentText =
    d.paymentMethod === "card-online"
      ? b(blocks, "payment_card", vars)
      : b(blocks, "payment_cash", vars);
  const footnoteText = b(blocks, "footnote", vars);

  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      ${escapeHtml(eyebrowText)}
    </div>
    <span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">${escapeHtml(greetingText)}</span>
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      ${textToHtml(introText)}
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
      ${itemsRows}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
      ${totalsRows}
    </table>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      <strong style="color:${INK};">${escapeHtml(shippingHeadingText)}</strong><br />
      ${textToHtml(shippingText)}
    </p>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:16px 0 0 0;">
      <strong style="color:${INK};">${escapeHtml(paymentHeadingText)}</strong><br />
      ${textToHtml(paymentText)}
    </p>

    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:32px 0 0 0;">
      ${textToHtml(footnoteText)}
    </p>`;

  return {
    content,
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
      ${escapeHtml(b(blocks, "eyebrow", vars))}
    </div>
    <span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">${escapeHtml(greetingText)}</span>
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      ${textToHtml(introText)}
    </p>

    ${awbBlock}

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      ${textToHtml(b(blocks, "advice", vars))}
    </p>
    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:20px 0 0 0;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </p>`;

  return {
    content,
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

  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      ${escapeHtml(b(blocks, "eyebrow", vars))}
    </div>
    <span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">${escapeHtml(greetingText)}</span>
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      ${textToHtml(b(blocks, "intro", vars))}
    </p>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      <strong style="color:${INK};">${escapeHtml(b(blocks, "serving_heading", vars))}</strong><br />
      ${textToHtml(b(blocks, "serving_body", vars))}
    </p>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:20px 0 0 0;">
      <strong style="color:${INK};">${escapeHtml(b(blocks, "return_heading", vars))}</strong><br />
      ${textToHtml(b(blocks, "return_body", vars))}
    </p>

    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:32px 0 0 0;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </p>`;

  return {
    content,
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
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      ${escapeHtml(b(blocks, "eyebrow", vars))}
    </div>
    <span style="font-family:${SERIF};font-size:32px;color:${INK};letter-spacing:-0.015em;">${escapeHtml(greetingText)}</span>
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      ${textToHtml(b(blocks, "intro", vars))}
    </p>

    <div style="margin-top:32px;padding:24px;background:${PAMANT};border:1px solid ${LINE};text-align:center;">
      <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:8px;">
        ${escapeHtml(b(blocks, "amount_label", vars))}
      </div>
      <div style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.01em;">
        ${formatRon(d.refundedRon)}
      </div>
    </div>

    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      <strong style="color:${INK};">${escapeHtml(b(blocks, "method_heading", vars))}</strong><br />
      ${textToHtml(methodText)}
    </p>

    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:32px 0 0 0;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </p>`;

  return {
    content,
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
      ${escapeHtml(eyebrow)}
    </div>
    <span style="font-family:${SERIF};font-size:32px;color:${INK};letter-spacing:-0.015em;">${escapeHtml(headline)}</span>
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      ${textToHtml(body)}
    </p>

    ${adminBlock}

    <p style="font-family:${MONO};font-size:12px;line-height:1.7;color:${INK_MUTE};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      ${textToHtml(b(blocks, "footnote", vars))}
    </p>`;

  return { content, preheader: headline };
}

// ─── Newsletter welcome ────────────────────────────────────────

export function assembleNewsletterWelcome(
  blocks: Record<string, string>,
  vars: Record<string, string | number | undefined>,
): Assembled {
  const content = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_MUTE};margin-bottom:14px;">
      ${escapeHtml(b(blocks, "eyebrow", vars))}
    </div>
    <span style="font-family:${SERIF};font-size:36px;color:${INK};letter-spacing:-0.015em;">${escapeHtml(b(blocks, "greeting", vars))}</span>
    <p style="font-family:${MONO};font-size:14px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      ${textToHtml(b(blocks, "para_1", vars))}
    </p>
    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:24px 0 0 0;">
      ${textToHtml(b(blocks, "para_2", vars))}
    </p>
    <p style="font-family:${MONO};font-size:13px;line-height:1.85;color:${INK_SOFT};margin:32px 0 0 0;border-top:1px solid ${LINE};padding-top:24px;">
      ${textToHtml(b(blocks, "para_3", vars))}
    </p>`;

  return { content, preheader: "Notițe rare din vie și pivniță." };
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
      Comanda e marcată ca <strong style="color:${INK};">paid</strong> în Supabase.
      Următorul pas: FGO (factură) și FanCourier (AWB) — încă manual.
    </p>`;

  return {
    subject: `🍷 Comandă nouă · ${d.orderNumber} · ${formatRon(d.totalRon)}`,
    html: shell(content, `${d.orderNumber} · ${formatRon(d.totalRon)}`),
  };
}
