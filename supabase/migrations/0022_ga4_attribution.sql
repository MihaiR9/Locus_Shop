-- GA4 server-side purchase + coupon on the order.
--
-- The Stripe webhook sends `purchase` to GA4 through the Measurement
-- Protocol, so a sale still counts when the customer never comes back to
-- /checkout/success. GA4 needs the visitor's client_id and session_id to
-- tie that sale to the visit; they only exist in the browser at checkout,
-- so we keep them on the order. Filled only with analytics consent.
--
-- coupon_code: the voucher typed at checkout, reported as `coupon`.

alter table public.orders
  add column if not exists ga_client_id  text,
  add column if not exists ga_session_id text,
  add column if not exists coupon_code   text;
