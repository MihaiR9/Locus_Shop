"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProductBottle } from "@/components/landing/product-bottle";
import { type ReturnPickerOrder } from "@/lib/account/returns";
import { formatRon } from "@/lib/wines";
import { submitReturnRequest } from "./actions";

type Props = {
  eligibleOrders: ReturnPickerOrder[];
  ineligibleOrders: ReturnPickerOrder[];
  preselectedOrder?: string;
};

const STATES = [
  { value: "sigilat" as const, title: "Sticla sigilată (nedeschisă)" },
  { value: "deteriorat" as const, title: "Sticla deteriorată la livrare" },
  { value: "neconform" as const, title: "Vinul nu corespunde descrierii" },
];

const RESOLUTIONS = [
  { value: "rambursare" as const, label: "Rambursare integrală pe metoda de plată folosită" },
  { value: "inlocuire" as const, label: "Înlocuire (același vin)" },
  { value: "voucher" as const, label: "Voucher pentru altă comandă (+10% bonus)" },
];

const RO_DATE = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ReturnWizard({
  eligibleOrders,
  ineligibleOrders,
  preselectedOrder,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(
    preselectedOrder ?? null,
  );
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [productState, setProductState] =
    useState<typeof STATES[number]["value"]>("sigilat");
  const [explain, setExplain] = useState("");
  const [resolution, setResolution] =
    useState<typeof RESOLUTIONS[number]["value"]>("rambursare");
  const [iban, setIban] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOrder =
    eligibleOrders.find(
      (g) => g.order.order_number === selectedOrderNumber,
    ) || null;

  function toggleItem(orderItemId: string) {
    setError(null);
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderItemId)) next.delete(orderItemId);
      else next.add(orderItemId);
      return next;
    });
  }

  function pickOrder(orderNumber: string) {
    setError(null);
    setSelectedOrderNumber(orderNumber);
    setSelectedItemIds(new Set());
  }

  function changeOrder() {
    setSelectedOrderNumber(null);
    setSelectedItemIds(new Set());
    setError(null);
  }

  function next() {
    setError(null);
    if (step === 1) {
      if (!selectedOrder) {
        return setError("Alege o comandă din care vrei să returnezi.");
      }
      if (selectedItemIds.size === 0) {
        return setError("Bifează cel puțin un produs din comandă.");
      }
      setStep(2);
    } else if (step === 2) {
      if (productState === "neconform" && explain.trim().length < 10) {
        return setError(
          "Pentru produs neconform, descrie pe scurt ce nu corespunde (min. 10 caractere).",
        );
      }
      setStep(3);
    } else {
      submit();
    }
  }

  function back() {
    setError(null);
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  }

  function submit() {
    if (resolution === "rambursare" && iban.trim().length < 15) {
      return setError(
        "Pentru rambursare, completează un IBAN valid (sau alege voucher).",
      );
    }
    if (!selectedOrder) return;
    setSubmitting(true);

    startTransition(async () => {
      const res = await submitReturnRequest({
        orderNumber: selectedOrder.order.order_number,
        orderItemIds: Array.from(selectedItemIds),
        productState,
        resolution,
        reason: explain,
        iban,
      });
      if (!res.ok) {
        setSubmitting(false);
        return setError(res.error);
      }
      router.push(
        `/cont/retururi/${encodeURIComponent(res.returnNumber)}?just-created=1`,
      );
    });
  }

  return (
    <>
      {/* Step indicator */}
      <ol className="wizard-steps" role="list">
        <li className={`wizard-step ${step === 1 ? "is-active" : "is-done"}`}>
          <span className="num">{step > 1 ? "✓" : "1"}</span>
          Produs
        </li>
        <li
          className={`wizard-step ${
            step === 2 ? "is-active" : step > 2 ? "is-done" : ""
          }`}
        >
          <span className="num">{step > 2 ? "✓" : "2"}</span>
          Motiv
        </li>
        <li className={`wizard-step ${step === 3 ? "is-active" : ""}`}>
          <span className="num">3</span>
          Rezolvare
        </li>
      </ol>

      {/* STEP 1 — order + items picker */}
      {step === 1 && (
        <>
          <h2
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(22px, 2.4vw, 28px)",
              color: "var(--ink)",
              fontWeight: 400,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            1. Alege comanda și produsele
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              lineHeight: 1.85,
              color: "var(--ink-soft)",
              marginBottom: 20,
            }}
          >
            {!selectedOrder
              ? "Alege întâi o comandă, apoi bifează produsele pentru care vrei retur (poți alege parțial)."
              : "Bifează produsele pentru care vrei retur. Cele cu „deja returnat” nu mai pot fi selectate."}
          </p>

          {/* Picker — order list view */}
          {!selectedOrder && (
            <>
              {eligibleOrders.length === 0 && ineligibleOrders.length === 0 && (
                <div className="wizard-empty">
                  <strong>Nu există comenzi.</strong>
                  <br />
                  Pentru a face un retur ai nevoie de cel puțin o comandă
                  livrată în ultimele 14 zile.
                </div>
              )}

              {eligibleOrders.length === 0 && ineligibleOrders.length > 0 && (
                <div className="wizard-empty">
                  <strong>Nicio comandă eligibilă pentru retur.</strong>
                  <br />
                  Termenul legal e de 14 zile de la primirea coletului
                  (OUG 34/2014). Mai jos vezi comenzile recente și de ce nu mai
                  pot fi returnate.
                </div>
              )}

              {/* Eligible orders */}
              {eligibleOrders.map((g) => {
                const elig = g.eligibility;
                return (
                  <div
                    key={g.order.order_number}
                    className="wizard-order-group"
                  >
                    <button
                      type="button"
                      className="order-head"
                      onClick={() => pickOrder(g.order.order_number)}
                    >
                      <div>
                        <div className="meta">
                          comanda · {RO_DATE.format(new Date(g.order.created_at))}
                        </div>
                        <div className="num">{g.order.order_number}</div>
                      </div>
                      <div className="right">
                        {elig.eligible &&
                          `mai ai ${elig.daysLeft} ${elig.daysLeft === 1 ? "zi" : "zile"} →`}
                      </div>
                    </button>
                  </div>
                );
              })}

              {/* Ineligible orders — informational */}
              {ineligibleOrders.length > 0 && (
                <>
                  <div className="wizard-order-section-title">
                    Comenzi care nu mai pot fi returnate
                  </div>
                  {ineligibleOrders.map((g) => {
                    const allReturned = g.items.every((i) => i.alreadyReturned);
                    const reason = !g.eligibility.eligible
                      ? g.eligibility.reason
                      : allReturned
                        ? "Toate produsele din această comandă au deja un retur deschis."
                        : "—";
                    return (
                      <div
                        key={g.order.order_number}
                        className="wizard-order-group is-ineligible"
                      >
                        <div className="order-head" style={{ cursor: "default" }}>
                          <div>
                            <div className="meta">
                              comanda · {RO_DATE.format(new Date(g.order.created_at))}
                            </div>
                            <div className="num">{g.order.order_number}</div>
                          </div>
                          <div className="right is-warn">indisponibilă</div>
                        </div>
                        <div className="ineligible-note">{reason}</div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* Picker — items view (after order selected) */}
          {selectedOrder && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 16,
                  padding: "14px 18px",
                  border: "1px solid var(--ink)",
                  background: "var(--bg)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "var(--ink-mute)",
                      marginBottom: 4,
                    }}
                  >
                    comandă selectată
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif), Georgia, serif",
                      fontSize: 20,
                      color: "var(--ink)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {selectedOrder.order.order_number}
                    {selectedOrder.eligibility.eligible && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono), monospace",
                          fontSize: 11,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--ink-mute)",
                          marginLeft: 12,
                        }}
                      >
                        · mai ai {selectedOrder.eligibility.daysLeft}{" "}
                        {selectedOrder.eligibility.daysLeft === 1 ? "zi" : "zile"}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={changeOrder}
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    background: "transparent",
                    border: "1px solid var(--line)",
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                >
                  schimbă comandă
                </button>
              </div>

              <div className="wizard-reason">
                {selectedOrder.items.map((it) => {
                  const checked = selectedItemIds.has(it.orderItemId);
                  return (
                    <label
                      key={it.code}
                      className="wizard-reason-option"
                      style={{
                        gridTemplateColumns: "18px 56px 1fr auto",
                        columnGap: 16,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={it.alreadyReturned}
                        onChange={() => toggleItem(it.orderItemId)}
                      />
                      <div style={{ width: 56, marginTop: -2 }}>
                        <ProductBottle
                          code={it.code}
                          name={it.name}
                          gama={it.gama}
                          color={it.bottleColor}
                          size={56}
                        />
                      </div>
                      <span>
                        <span className="title">{it.name}</span>
                        <span className="desc">
                          {it.gama} · {it.code} · cantitate {it.qty} ·{" "}
                          {formatRon(it.unitPriceRon)} / sticlă
                          {it.alreadyReturned && (
                            <>
                              <br />
                              <span className="meta-pill">deja returnat</span>
                            </>
                          )}
                        </span>
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono), monospace",
                          fontSize: 12,
                          color: "var(--ink-soft)",
                          alignSelf: "center",
                        }}
                      >
                        {formatRon(it.unitPriceRon * it.qty)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* STEP 2 — reason */}
      {step === 2 && selectedOrder && (
        <>
          <h2
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(22px, 2.4vw, 28px)",
              color: "var(--ink)",
              fontWeight: 400,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            2. Care e starea produsului?
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              lineHeight: 1.85,
              color: "var(--ink-soft)",
              marginBottom: 20,
            }}
          >
            Pentru {selectedItemIds.size}{" "}
            {selectedItemIds.size === 1 ? "produs" : "produse"} din comanda{" "}
            <strong>{selectedOrder.order.order_number}</strong>.
          </p>

          <div className="wizard-reason">
            {STATES.map((s) => (
              <label
                key={s.value}
                className="wizard-reason-option is-single"
              >
                <input
                  type="radio"
                  name="state"
                  value={s.value}
                  checked={productState === s.value}
                  onChange={() => setProductState(s.value)}
                />
                <span>
                  <span className="title">{s.title}</span>
                </span>
              </label>
            ))}
          </div>

          {(productState === "neconform" || productState === "deteriorat") && (
            <div
              className="field"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <label
                htmlFor="explain"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--ink-mute)",
                }}
              >
                Explicație
                {productState === "neconform"
                  ? " (obligatoriu)"
                  : " (opțional)"}
              </label>
              <textarea
                id="explain"
                value={explain}
                onChange={(e) => setExplain(e.target.value)}
                placeholder={
                  productState === "deteriorat"
                    ? "Ex: dopul deplasat, eticheta umedă, sticla crăpată..."
                    : "Ex: gust diferit de descriere, etichetă greșită..."
                }
                rows={4}
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--ink)",
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  padding: "12px 14px",
                  borderRadius: 0,
                  resize: "vertical",
                }}
              />
            </div>
          )}
        </>
      )}

      {/* STEP 3 — resolution */}
      {step === 3 && selectedOrder && (
        <>
          <h2
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(22px, 2.4vw, 28px)",
              color: "var(--ink)",
              fontWeight: 400,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            3. Cum preferi să rezolvăm
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              lineHeight: 1.85,
              color: "var(--ink-soft)",
              marginBottom: 20,
            }}
          >
            Pentru {selectedItemIds.size}{" "}
            {selectedItemIds.size === 1 ? "produs" : "produse"} din{" "}
            <strong>{selectedOrder.order.order_number}</strong>.
          </p>

          <div className="wizard-reason">
            {RESOLUTIONS.map((r) => (
              <label
                key={r.value}
                className="wizard-reason-option is-single"
              >
                <input
                  type="radio"
                  name="resolution"
                  value={r.value}
                  checked={resolution === r.value}
                  onChange={() => setResolution(r.value)}
                />
                <span>
                  <span className="title">{r.label}</span>
                </span>
              </label>
            ))}
          </div>

          {resolution === "rambursare" && (
            <div
              className="field"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <label
                htmlFor="iban"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--ink-mute)",
                }}
              >
                IBAN pentru rambursare
              </label>
              <input
                id="iban"
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase())}
                placeholder="RO49 AAAA 1B31 0075 9384 0000"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                  color: "var(--ink)",
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  padding: "12px 14px",
                  borderRadius: 0,
                  letterSpacing: "0.04em",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10,
                  color: "var(--ink-mute)",
                  letterSpacing: "0.04em",
                }}
              >
                Pentru plățile cu cardul, banii se întorc automat pe cardul
                folosit. IBAN-ul îl folosim doar dacă plata a fost prin altă
                metodă.
              </p>
            </div>
          )}
        </>
      )}

      {error && (
        <p
          role="alert"
          style={{
            margin: "12px 0",
            color: "#a23",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
          }}
        >
          {error}
        </p>
      )}

      <div className="wizard-actions">
        {step > 1 ? (
          <button type="button" className="back" onClick={back}>
            ← înapoi
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="next"
          onClick={next}
          disabled={
            submitting ||
            (step === 1 && (!selectedOrder || selectedItemIds.size === 0))
          }
        >
          {submitting
            ? "se trimite…"
            : step < 3
              ? "continuă"
              : "trimite cererea"}
          <svg
            className="arrow-svg"
            width="16"
            height="8"
            viewBox="0 0 24 12"
            aria-hidden="true"
          >
            <use href="#arrow-right" />
          </svg>
        </button>
      </div>
    </>
  );
}
