import "server-only";
import {
  getResend,
  fromAddress,
  adminEmail,
  recipientFor,
} from "@/lib/resend/server";
import {
  orderConfirmationHtml,
  adminOrderNotificationHtml,
  newsletterWelcomeHtml,
  type OrderConfirmationData,
} from "@/lib/email/templates";

type SendResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Customer order confirmation — fires after Stripe webhook marks
 * the order paid (or after a card-livrare order is placed).
 */
export async function sendOrderConfirmation(
  to: string,
  data: OrderConfirmationData,
): Promise<SendResult> {
  const tpl = orderConfirmationHtml(data);
  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(to),
      subject: tpl.subject,
      html: tpl.html,
    });
    if (result.error) {
      console.error("[email] order confirmation failed", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    console.error("[email] order confirmation exception", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}

/**
 * Internal admin notification — same trigger as the customer one.
 * Goes to RESEND_ADMIN_EMAIL (default office@domeniul-locus.ro).
 */
export async function sendOrderNotificationToAdmin(
  data: OrderConfirmationData & {
    customerEmail?: string | null;
    customerPhone?: string | null;
  },
): Promise<SendResult> {
  const tpl = adminOrderNotificationHtml(data);
  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(adminEmail()),
      subject: tpl.subject,
      html: tpl.html,
    });
    if (result.error) {
      console.error("[email] admin notification failed", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    console.error("[email] admin notification exception", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}

/**
 * Newsletter welcome — fires when someone submits the footer signup.
 */
export async function sendNewsletterWelcome(to: string): Promise<SendResult> {
  const tpl = newsletterWelcomeHtml();
  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(to),
      subject: tpl.subject,
      html: tpl.html,
    });
    if (result.error) {
      console.error("[email] newsletter welcome failed", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    console.error("[email] newsletter welcome exception", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}
