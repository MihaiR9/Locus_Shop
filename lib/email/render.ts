import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  ALL_EMAIL_TEMPLATES,
  getTemplateDef,
  interpolate,
  type EmailTemplateDef,
} from "@/lib/email/schema";
import {
  shell,
  assembleOrderConfirmation,
  assembleShipped,
  assembleDelivered,
  assembleRefundConfirmation,
  assembleReturnStatus,
  assembleNewsletterWelcome,
} from "@/lib/email/templates";
import type {
  OrderConfirmationData,
  ShippedEmailData,
  DeliveredEmailData,
  RefundEmailData,
  ReturnStatusEmailData,
} from "@/lib/email/templates";

// ─── Load blocks din DB ─────────────────────────────────────────
// Fallback pe defaults dacă DB-ul nu are template-ul salvat încă
// (primul rulaj înainte de seed).

export type LoadedTemplate = {
  subject: string;
  blocks: Record<string, string>;
};

export async function loadTemplate(key: string): Promise<LoadedTemplate> {
  const def = getTemplateDef(key);
  if (!def) throw new Error(`Unknown email template: ${key}`);

  const defaults = defaultBlocks(def);

  // Server client — folosește sesiunea admin curentă. Pentru webhook Stripe
  // (fără sesiune), avem policy public_read pe email_templates ca să funcționeze.
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select("subject, blocks")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.warn("[email/render] loadTemplate DB error", key, error.message);
      return { subject: def.subject, blocks: defaults };
    }
    if (!data) {
      return { subject: def.subject, blocks: defaults };
    }
    return {
      subject: data.subject ?? def.subject,
      blocks: {
        ...defaults,
        ...((data.blocks as Record<string, string> | null) ?? {}),
      },
    };
  } catch (err) {
    console.warn("[email/render] loadTemplate exception", key, err);
    return { subject: def.subject, blocks: defaults };
  }
}

export function defaultBlocks(def: EmailTemplateDef): Record<string, string> {
  const acc: Record<string, string> = {};
  def.blocks.forEach((b) => {
    acc[b.key] = b.defaultValue;
  });
  return acc;
}

// ─── Render final ────────────────────────────────────────────────
// Fiecare funcție renderXxx() întoarce { subject, html } gata de trimis.

export type Rendered = { subject: string; html: string };

async function renderWith<TCtx>(
  key: string,
  ctx: TCtx,
  assemble: (
    blocks: Record<string, string>,
    ctx: TCtx,
  ) => { content: string; preheader: string },
): Promise<Rendered> {
  const { subject: subjectTpl, blocks } = await loadTemplate(key);
  const vars = ctx as unknown as Record<string, string | number | undefined>;
  const subject = interpolate(subjectTpl, vars);
  const { content, preheader } = assemble(blocks, ctx);
  return { subject, html: shell(content, preheader) };
}

export function renderOrderConfirmation(
  data: OrderConfirmationData,
): Promise<Rendered> {
  return renderWith("order_confirmation", data, assembleOrderConfirmation);
}

export function renderShipped(data: ShippedEmailData): Promise<Rendered> {
  return renderWith("shipped", data, assembleShipped);
}

export function renderDelivered(data: DeliveredEmailData): Promise<Rendered> {
  return renderWith("delivered", data, assembleDelivered);
}

export function renderRefundConfirmation(
  data: RefundEmailData,
): Promise<Rendered> {
  return renderWith("refund_confirmation", data, assembleRefundConfirmation);
}

export function renderReturnStatus(
  data: ReturnStatusEmailData,
): Promise<Rendered> {
  // Subject-ul are nevoie de {{statusLabel}} derivat din status.
  const statusLabels: Record<ReturnStatusEmailData["status"], string> = {
    approved: "aprobat",
    in_transit: "în transport",
    completed: "finalizat",
    rejected: "respins",
  };
  const enrichedCtx = {
    ...data,
    statusLabel: statusLabels[data.status],
  } as unknown as ReturnStatusEmailData & { statusLabel: string };
  return renderWith("return_status", enrichedCtx, assembleReturnStatus);
}

export function renderNewsletterWelcome(): Promise<Rendered> {
  return renderWith("newsletter_welcome", {}, () =>
    assembleNewsletterWelcome({}, {}),
  );
}

// ─── Preview (folosit din admin) ─────────────────────────────────
// Randează un template cu datele sample din schema, folosind blocks
// pasate direct (nu din DB). Astfel poți vedea preview la edit înainte
// să salvezi.

export function previewTemplate(
  key: string,
  overrideBlocks: Record<string, string>,
  overrideSubject?: string,
): Rendered {
  const def = getTemplateDef(key);
  if (!def) throw new Error(`Unknown email template: ${key}`);

  const blocks = { ...defaultBlocks(def), ...overrideBlocks };
  const subjectTpl = overrideSubject ?? def.subject;
  const vars = def.sampleVariables as Record<string, string | number>;
  const subject = interpolate(subjectTpl, vars);

  let content = "";
  let preheader = "";
  switch (key) {
    case "order_confirmation":
      ({ content, preheader } = assembleOrderConfirmation(
        blocks,
        SAMPLE_ORDER,
      ));
      break;
    case "shipped":
      ({ content, preheader } = assembleShipped(blocks, SAMPLE_SHIPPED));
      break;
    case "delivered":
      ({ content, preheader } = assembleDelivered(blocks, SAMPLE_DELIVERED));
      break;
    case "refund_confirmation":
      ({ content, preheader } = assembleRefundConfirmation(
        blocks,
        SAMPLE_REFUND,
      ));
      break;
    case "return_status":
      ({ content, preheader } = assembleReturnStatus(
        blocks,
        SAMPLE_RETURN,
      ));
      break;
    case "newsletter_welcome":
      ({ content, preheader } = assembleNewsletterWelcome(blocks, {}));
      break;
    default:
      throw new Error(`No preview handler for template ${key}`);
  }

  return { subject, html: shell(content, preheader) };
}

// ─── Sample structured data pentru preview ──────────────────────
// Complementează sampleVariables din schema (care sunt doar strings).
// Aici sunt items + totals — parte din design, nu textul edit-abil.

const SAMPLE_ORDER: OrderConfirmationData = {
  orderNumber: "LC26071500001",
  customerName: "Andrei",
  items: [
    { name: "Fetească Regală", code: "LC01", qty: 2, unitPriceRon: 79 },
    { name: "Fetească Neagră", code: "LC02", qty: 1, unitPriceRon: 89 },
  ],
  subtotalRon: 247,
  shippingRon: 0,
  discountRon: 0,
  totalRon: 247,
  shippingMethod: "curier",
  shippingAddress: "Str. Exemplu 12, București, Sector 3",
  paymentMethod: "card-online",
};

const SAMPLE_SHIPPED: ShippedEmailData = {
  orderNumber: "LC26071500001",
  customerName: "Andrei",
  awbNumber: "FC123456789",
  courierName: "FanCourier",
  shippingAddress: "Str. Exemplu 12, București",
};

const SAMPLE_DELIVERED: DeliveredEmailData = {
  orderNumber: "LC26071500001",
  customerName: "Andrei",
};

const SAMPLE_REFUND: RefundEmailData = {
  orderNumber: "LC26071500001",
  customerName: "Andrei",
  refundedRon: 158,
  method: "stripe",
  isPartial: false,
};

const SAMPLE_RETURN: ReturnStatusEmailData & { statusLabel: string } = {
  returnNumber: "RET-2026-042",
  orderNumber: "LC26071500001",
  customerName: "Andrei",
  status: "approved",
  statusLabel: "aprobat",
};

// ─── Seed helper (used from admin first visit if empty) ─────────
export async function seedTemplatesIfMissing(): Promise<{
  seeded: number;
  skipped: number;
}> {
  const supabase = await getSupabaseServerClient();
  const { data: existing } = await supabase
    .from("email_templates")
    .select("key");
  const existingKeys = new Set((existing ?? []).map((r) => r.key));

  let seeded = 0;
  let skipped = 0;

  for (const def of ALL_EMAIL_TEMPLATES) {
    if (existingKeys.has(def.key)) {
      skipped++;
      continue;
    }
    await supabase.from("email_templates").insert({
      key: def.key,
      subject: def.subject,
      blocks: defaultBlocks(def),
    });
    seeded++;
  }

  return { seeded, skipped };
}
