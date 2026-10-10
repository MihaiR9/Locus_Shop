"use client";

import { useEffect } from "react";
import { markOrdersSeen } from "../../_components/orders-activity-actions";
import { ORDERS_SEEN_EVENT } from "../../_components/orders-activity-event";

/**
 * Marchează comenzile ca văzute după ce lista s-a afișat. Punctele roșii
 * rămân pe rânduri cât timp pagina e deschisă (au fost calculate înainte).
 */
export function MarkOrdersSeen() {
  useEffect(() => {
    markOrdersSeen().then(() => window.dispatchEvent(new Event(ORDERS_SEEN_EVENT)));
  }, []);
  return null;
}
