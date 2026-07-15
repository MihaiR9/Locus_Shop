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
  shippedNotificationHtml,
  deliveredNotificationHtml,
  refundConfirmationHtml,
  returnStatusUpdateHtml,
  type OrderConfirmationData,
  type ShippedEmailData,
  type DeliveredEmailData,
  type RefundEmailData,
  type ReturnStatusEmailData,
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
 * Shipped notification — fires when admin marks an order as expediat.
 * AWB e opțional (deocamdată admin îl introduce manual; când integrăm
 * FanCourier API va fi generat automat).
 */
export async function sendShippedNotification(
  to: string,
  data: ShippedEmailData,
): Promise<SendResult> {
  const tpl = shippedNotificationHtml(data);
  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(to),
      subject: tpl.subject,
      html: tpl.html,
    });
    if (result.error) {
      console.error("[email] shipped notification failed", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    console.error("[email] shipped notification exception", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}

/**
 * Delivered notification — fires when admin marks livrată.
 * Include instrucțiuni scurte de servire + reminder retur (14 zile).
 */
export async function sendDeliveredNotification(
  to: string,
  data: DeliveredEmailData,
): Promise<SendResult> {
  const tpl = deliveredNotificationHtml(data);
  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(to),
      subject: tpl.subject,
      html: tpl.html,
    });
    if (result.error) {
      console.error("[email] delivered notification failed", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    console.error("[email] delivered notification exception", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}

/**
 * Refund confirmation — fires când admin apasă „Rambursează" (Stripe SAU
 * manual — transfer bancar / cash). Include suma + metoda + timeline.
 */
export async function sendRefundConfirmation(
  to: string,
  data: RefundEmailData,
): Promise<SendResult> {
  const tpl = refundConfirmationHtml(data);
  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(to),
      subject: tpl.subject,
      html: tpl.html,
    });
    if (result.error) {
      console.error("[email] refund confirmation failed", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    console.error("[email] refund confirmation exception", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}

/**
 * Return status update — fires când admin schimbă statusul cererii de retur
 * (approved / in_transit / completed / rejected). Opțional include un
 * mesaj personalizat de la admin.
 */
export async function sendReturnStatusUpdate(
  to: string,
  data: ReturnStatusEmailData,
): Promise<SendResult> {
  const tpl = returnStatusUpdateHtml(data);
  try {
    const result = await getResend().emails.send({
      from: fromAddress(),
      to: recipientFor(to),
      subject: tpl.subject,
      html: tpl.html,
    });
    if (result.error) {
      console.error("[email] return status update failed", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    console.error("[email] return status update exception", err);
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
