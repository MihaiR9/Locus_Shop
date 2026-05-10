import Link from "next/link";
import { formatRon } from "@/lib/wines";
import {
  ronFromCents,
  STATUS_LABEL,
  type OrderRow,
} from "@/lib/account/orders";

const RO_DATE = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function summary(items: OrderRow["items"]): string {
  if (items.length === 0) return "—";
  const first = items[0];
  const firstLabel = `${first.qty} × ${first.name}`;
  if (items.length === 1) return firstLabel;
  const rest = items.length - 1;
  return `${firstLabel} + încă ${rest} ${rest === 1 ? "soi" : "soiuri"}`;
}

export function OrderCard({ order }: { order: OrderRow }) {
  return (
    <Link
      href={`/cont/comenzi/${encodeURIComponent(order.order_number)}`}
      className="order-card"
    >
      <div>
        <div className="head">
          <span className="number">{order.order_number}</span>
          <span className="date">
            {RO_DATE.format(new Date(order.created_at))}
          </span>
        </div>
        <div className="items">{summary(order.items)}</div>
      </div>
      <div className="right">
        <span className="status-pill" data-status={order.status}>
          {STATUS_LABEL[order.status]}
        </span>
        <span className="total">
          {formatRon(ronFromCents(order.total_cents))}
        </span>
      </div>
    </Link>
  );
}
