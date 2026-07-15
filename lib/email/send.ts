import "server-only";
import {
  getResend,
  fromAddress,
  adminEmail,
  recipientFor,
} from "@/lib/resend/server";
import {
  adminOrderNotificationHtml,
  type OrderConfirmationData,
  type ShippedEmailData,
  type DeliveredEmailData,
  type RefundEmailData,
  type ReturnStatusEmailData,
} from "@/lib/email/templates";
import {
  renderOrderConfirmation,
  renderShipped,
  renderDelivered,
  renderRefundConfirmation,
  renderReturnStatus,
  renderNewsletterWelcome,
} from "@/lib/email/render";

type SendResult = { ok: true; id: string } | { ok: false; error: string };

async function sendRendered(
  to: string,
  rendered: { subject: string; html: string },
  logTag: string,
): Promise<SendResult> {
  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(to),
      subject: rendered.subject,
      html: rendered.html,
    });
    if (result.error) {
      console.error(`[email] ${logTag} failed`, result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    console.error(`[email] ${logTag} exception`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}

/**
 * Customer order confirmation — fires after Stripe webhook marks
 * the order paid (or after a card-livrare order is placed).
 * Text content e din DB (email_templates.key='order_confirmation').
 */
export async function sendOrderConfirmation(
  to: string,
  data: OrderConfirmationData,
): Promise<SendResult> {
  const rendered = await renderOrderConfirmation(data);
  return sendRendered(to, rendered, "order confirmation");
}

/**
 * Internal admin notification — HARDCODED template (nu e editabil din UI).
 * Goes to RESEND_ADMIN_EMAIL (default office@domeniul-locus.ro).
 */
export async function sendOrderNotificationToAdmin(
  data: OrderConfirmationData & {
    customerEmail?: string | null;
    customerPhone?: string | null;
  },
): Promise<SendResult> {
  const tpl = adminOrderNotificationHtml(data);
  return sendRendered(adminEmail(), tpl, "admin notification");
}

/**
 * Newsletter welcome — fires when someone submits the footer signup.
 */
export async function sendNewsletterWelcome(to: string): Promise<SendResult> {
  const rendered = await renderNewsletterWelcome();
  return sendRendered(to, rendered, "newsletter welcome");
}

/**
 * Shipped notification — fires when admin marks an order as expediat.
 */
export async function sendShippedNotification(
  to: string,
  data: ShippedEmailData,
): Promise<SendResult> {
  const rendered = await renderShipped(data);
  return sendRendered(to, rendered, "shipped notification");
}

/**
 * Delivered notification — fires when admin marks livrată.
 */
export async function sendDeliveredNotification(
  to: string,
  data: DeliveredEmailData,
): Promise<SendResult> {
  const rendered = await renderDelivered(data);
  return sendRendered(to, rendered, "delivered notification");
}

/**
 * Refund confirmation — fires când admin apasă „Rambursează" (Stripe SAU manual).
 */
export async function sendRefundConfirmation(
  to: string,
  data: RefundEmailData,
): Promise<SendResult> {
  const rendered = await renderRefundConfirmation(data);
  return sendRendered(to, rendered, "refund confirmation");
}

/**
 * Return status update — fires când admin schimbă statusul unei cereri retur.
 */
export async function sendReturnStatusUpdate(
  to: string,
  data: ReturnStatusEmailData,
): Promise<SendResult> {
  const rendered = await renderReturnStatus(data);
  return sendRendered(to, rendered, "return status update");
}
