import Link from "next/link";
import { formatRon } from "@/lib/wines";
import { type MockOrder, STATUS_LABEL } from "@/lib/mock-account";

const RO_DATE = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function summary(items: MockOrder["items"]): string {
  if (items.length === 0) return "—";
  if (items.length === 1) {
    const it = items[0];
    return `${it.qty} × ${it.name}`;
  }
  const first = items[0];
  const rest = items.length - 1;
  return `${first.qty} × ${first.name} + încă ${rest} ${rest === 1 ? "soi" : "soiuri"}`;
}

export function OrderCard({ order }: { order: MockOrder }) {
  return (
    <Link
      href={`/cont/comenzi/${encodeURIComponent(order.orderNumber)}`}
      className="order-card"
    >
      <div>
        <div className="head">
          <span className="number">{order.orderNumber}</span>
          <span className="date">{RO_DATE.format(new Date(order.createdAt))}</span>
        </div>
        <div className="items">{summary(order.items)}</div>
      </div>
      <div className="right">
        <span className="status-pill" data-status={order.status}>
          {STATUS_LABEL[order.status]}
        </span>
        <span className="total">{formatRon(order.totalRon)}</span>
      </div>
    </Link>
  );
}
