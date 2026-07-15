// Client-safe schema pentru email templates.
// Definește ce blocuri de text sunt editabile din admin pentru fiecare
// template + valorile default + variabilele disponibile în interpolare.
//
// Design-ul HTML/CSS rămâne în lib/email/templates.ts — aici doar textele.
//
// Convenție: interpolare cu {{variableName}} (dublu accolade).
// Exemplu: "Mulțumim, {{customerName}}." → "Mulțumim, Andrei."
// Dacă o variabilă lipsește, se înlocuiește cu string gol.

export type BlockKind = "input" | "textarea";

export type BlockDef = {
  key: string; // identificator intern (ex: 'greeting')
  label: string; // afișat în admin (ex: "Titlu mare")
  hint?: string; // hint sub label
  kind: BlockKind; // input single-line vs textarea multi-line
  defaultValue: string; // fallback dacă DB nu are valoare
};

export type EmailTemplateDef = {
  key: string; // ex: 'order_confirmation'
  name: string; // ex: "Confirmare comandă (client)"
  description: string; // când se trimite
  destination: "client" | "admin"; // cui e adresat
  variables: readonly string[]; // available placeholders
  subject: string; // default subject, poate conține {{vars}}
  blocks: readonly BlockDef[]; // texte editabile
  sampleVariables: Record<string, string | number>; // pentru preview
};

// ─── Order confirmation ─────────────────────────────────────────
export const ORDER_CONFIRMATION: EmailTemplateDef = {
  key: "order_confirmation",
  name: "Confirmare comandă (client)",
  description: "Trimis când Stripe confirmă plata (webhook payment_succeeded).",
  destination: "client",
  variables: [
    "orderNumber",
    "customerName",
    "totalRon",
    "shippingMethod",
    "shippingAddress",
    "paymentMethod",
  ],
  subject: "Comanda ta · {{orderNumber}}",
  blocks: [
    {
      key: "eyebrow",
      label: "Eyebrow (deasupra titlului)",
      hint: "Text mic uppercase. {{orderNumber}} disponibil.",
      kind: "input",
      defaultValue: "comandă confirmată · {{orderNumber}}",
    },
    {
      key: "greeting",
      label: "Titlu mare",
      hint: "Serif mare. {{customerName}} — dacă lipsește, se afișează fără nume.",
      kind: "input",
      defaultValue: "Mulțumim, {{customerName}}.",
    },
    {
      key: "greeting_guest",
      label: "Titlu mare (fără nume)",
      hint: "Când comanda e guest checkout, nu avem nume — se folosește ăsta.",
      kind: "input",
      defaultValue: "Mulțumim.",
    },
    {
      key: "intro",
      label: "Paragraf introductiv",
      hint: "Sub titlu, înainte de lista de produse.",
      kind: "textarea",
      defaultValue: "Am primit comanda ta și plata. Mai jos ai detaliile.",
    },
    {
      key: "shipping_heading",
      label: "Titlu secțiune livrare",
      kind: "input",
      defaultValue: "Livrare",
    },
    {
      key: "shipping_curier",
      label: "Text livrare — curier",
      hint: "Când comanda are livrare cu curierul. {{shippingAddress}} disponibil.",
      kind: "textarea",
      defaultValue:
        "Livrare prin curier la {{shippingAddress}}, în 2–4 zile lucrătoare.",
    },
    {
      key: "shipping_ridicare",
      label: "Text livrare — ridicare personală",
      kind: "textarea",
      defaultValue:
        "Ridicare personală — te anunțăm prin SMS și email când e gata.",
    },
    {
      key: "payment_heading",
      label: "Titlu secțiune plată",
      kind: "input",
      defaultValue: "Plată",
    },
    {
      key: "payment_card",
      label: "Text plată — card online",
      kind: "input",
      defaultValue: "Card online — încasată",
    },
    {
      key: "payment_cash",
      label: "Text plată — la livrare",
      kind: "input",
      defaultValue: "La livrare (ramburs)",
    },
    {
      key: "footnote",
      label: "Notă finală",
      kind: "textarea",
      defaultValue:
        "Pentru întrebări, scrie la contact@domeniul-locus.ro. Vinul, ca și locul, are nevoie de timp.",
    },
  ],
  sampleVariables: {
    orderNumber: "LC26071500001",
    customerName: "Andrei",
    totalRon: 158,
    shippingMethod: "curier",
    shippingAddress: "Str. Exemplu 12, București",
    paymentMethod: "card-online",
  },
};

// ─── Shipped ─────────────────────────────────────────────────────
export const SHIPPED: EmailTemplateDef = {
  key: "shipped",
  name: "Comandă expediată (client)",
  description: `Trimis când marchezi „Expediat" în admin.`,
  destination: "client",
  variables: [
    "orderNumber",
    "customerName",
    "awbNumber",
    "courierName",
    "shippingAddress",
  ],
  subject: "Comanda {{orderNumber}} · expediată",
  blocks: [
    {
      key: "eyebrow",
      label: "Eyebrow",
      kind: "input",
      defaultValue: "comandă expediată · {{orderNumber}}",
    },
    {
      key: "greeting",
      label: "Titlu (cu nume)",
      hint: "Folosește {{customerName}}.",
      kind: "input",
      defaultValue: "Coletul e pe drum, {{customerName}}.",
    },
    {
      key: "greeting_guest",
      label: "Titlu (fără nume)",
      kind: "input",
      defaultValue: "Coletul e pe drum.",
    },
    {
      key: "intro",
      label: "Paragraf introductiv",
      hint: "{{shippingAddress}} disponibil.",
      kind: "textarea",
      defaultValue:
        "Am predat coletul curierului. Livrarea durează în general 2–4 zile lucrătoare la {{shippingAddress}}.",
    },
    {
      key: "intro_no_address",
      label: "Paragraf introductiv (fără adresă)",
      hint: "Când nu avem adresă în snapshot.",
      kind: "textarea",
      defaultValue:
        "Am predat coletul curierului. Livrarea durează în general 2–4 zile lucrătoare.",
    },
    {
      key: "advice",
      label: "Sfat / follow-up",
      kind: "textarea",
      defaultValue:
        "Curierul te va contacta telefonic înainte de livrare. Dacă nu ești acasă, poți reprograma direct cu el.",
    },
    {
      key: "footnote",
      label: "Notă finală (deschidere colet)",
      kind: "textarea",
      defaultValue:
        "Recomandăm să deschizi coletul în prezența curierului — sticlele sunt fragile, iar dacă găsești ceva stricat, marchezi rezervă pe AWB și ne scrii la contact@domeniul-locus.ro.",
    },
  ],
  sampleVariables: {
    orderNumber: "LC26071500001",
    customerName: "Andrei",
    awbNumber: "FC123456789",
    courierName: "FanCourier",
    shippingAddress: "Str. Exemplu 12, București",
  },
};

// ─── Delivered ───────────────────────────────────────────────────
export const DELIVERED: EmailTemplateDef = {
  key: "delivered",
  name: "Comandă livrată (client)",
  description: `Trimis când marchezi „Livrat" în admin.`,
  destination: "client",
  variables: ["orderNumber", "customerName"],
  subject: "Comanda {{orderNumber}} · livrată",
  blocks: [
    {
      key: "eyebrow",
      label: "Eyebrow",
      kind: "input",
      defaultValue: "comandă livrată · {{orderNumber}}",
    },
    {
      key: "greeting",
      label: "Titlu (cu nume)",
      kind: "input",
      defaultValue: "Sper să-ți placă, {{customerName}}.",
    },
    {
      key: "greeting_guest",
      label: "Titlu (fără nume)",
      kind: "input",
      defaultValue: "Sper să-ți placă.",
    },
    {
      key: "intro",
      label: "Paragraf introductiv",
      kind: "textarea",
      defaultValue: "Coletul a ajuns. Deschide-l cu o urgență liniștită.",
    },
    {
      key: "serving_heading",
      label: "Titlu secțiune servire",
      kind: "input",
      defaultValue: "Cum să bei bine.",
    },
    {
      key: "serving_body",
      label: "Text sfaturi servire",
      kind: "textarea",
      defaultValue:
        "Vinurile albe și rosé la 8–10 °C, roșurile la 14–16 °C. Decantează Fetească Neagră 20–30 de minute înainte de servit — merită timpul.",
    },
    {
      key: "return_heading",
      label: "Titlu secțiune retur",
      kind: "input",
      defaultValue: "Ceva nu a mers?",
    },
    {
      key: "return_body",
      label: "Text drept retur (14 zile)",
      kind: "textarea",
      defaultValue:
        "Ai 14 zile calendaristice pentru drept de retragere (OUG 34/2014). Sticlele deschise sau deteriorate după livrare nu intră în acest drept. Deschide o cerere din contul tău sau scrie-ne direct la contact@domeniul-locus.ro.",
    },
    {
      key: "footnote",
      label: "Notă finală",
      kind: "textarea",
      defaultValue: "Vinul, ca și locul, are nevoie de timp. Noroc.",
    },
  ],
  sampleVariables: {
    orderNumber: "LC26071500001",
    customerName: "Andrei",
  },
};

// ─── Refund confirmation ────────────────────────────────────────
export const REFUND_CONFIRMATION: EmailTemplateDef = {
  key: "refund_confirmation",
  name: "Rambursare confirmată (client)",
  description: "Trimis când faci refund din admin (Stripe sau manual).",
  destination: "client",
  variables: ["orderNumber", "customerName", "refundedRon"],
  subject: "Rambursare {{orderNumber}} · {{refundedRon}} lei",
  blocks: [
    {
      key: "eyebrow",
      label: "Eyebrow",
      kind: "input",
      defaultValue: "rambursare · {{orderNumber}}",
    },
    {
      key: "greeting_full",
      label: "Titlu — refund complet, cu nume",
      kind: "input",
      defaultValue: "Rambursare confirmată, {{customerName}}.",
    },
    {
      key: "greeting_full_guest",
      label: "Titlu — refund complet, fără nume",
      kind: "input",
      defaultValue: "Rambursare confirmată.",
    },
    {
      key: "greeting_partial",
      label: "Titlu — refund parțial, cu nume",
      kind: "input",
      defaultValue: "Rambursare parțială, {{customerName}}.",
    },
    {
      key: "greeting_partial_guest",
      label: "Titlu — refund parțial, fără nume",
      kind: "input",
      defaultValue: "Rambursare parțială.",
    },
    {
      key: "intro",
      label: "Paragraf introductiv",
      kind: "textarea",
      defaultValue: "Am procesat rambursarea pentru comanda ta.",
    },
    {
      key: "amount_label",
      label: "Eticheta sumă (deasupra valorii)",
      kind: "input",
      defaultValue: "Sumă rambursată",
    },
    {
      key: "method_heading",
      label: "Titlu secțiune metodă",
      kind: "input",
      defaultValue: "Metodă",
    },
    {
      key: "method_stripe",
      label: "Metodă — Stripe (înapoi pe card)",
      kind: "textarea",
      defaultValue:
        "Se întoarce pe cardul cu care ai plătit. Ajunge în 3–7 zile lucrătoare (depinde de banca ta).",
    },
    {
      key: "method_transfer",
      label: "Metodă — transfer bancar manual",
      kind: "textarea",
      defaultValue:
        "Transfer bancar direct în contul tău. Confirmarea a plecat din banca noastră astăzi.",
    },
    {
      key: "method_cash",
      label: "Metodă — cash",
      kind: "textarea",
      defaultValue: "Rambursat în numerar.",
    },
    {
      key: "method_other",
      label: "Metodă — altele",
      kind: "textarea",
      defaultValue: "Rambursare manuală procesată.",
    },
    {
      key: "footnote",
      label: "Notă finală",
      kind: "textarea",
      defaultValue:
        "Dacă nu vezi suma pe extras după termenul menționat, scrie la contact@domeniul-locus.ro cu numărul comenzii — verificăm imediat.",
    },
  ],
  sampleVariables: {
    orderNumber: "LC26071500001",
    customerName: "Andrei",
    refundedRon: 158,
  },
};

// ─── Return status update ───────────────────────────────────────
export const RETURN_STATUS: EmailTemplateDef = {
  key: "return_status",
  name: "Update status retur (client)",
  description:
    "Trimis când schimbi statusul unei cereri de retur în admin (approved / in_transit / completed / rejected).",
  destination: "client",
  variables: ["returnNumber", "orderNumber", "customerName"],
  subject: "Retur {{returnNumber}} · {{statusLabel}}",
  blocks: [
    {
      key: "eyebrow_with_order",
      label: "Eyebrow (cu numărul comenzii)",
      kind: "input",
      defaultValue: "retur · {{returnNumber}} · comandă {{orderNumber}}",
    },
    {
      key: "eyebrow_no_order",
      label: "Eyebrow (fără număr comandă)",
      kind: "input",
      defaultValue: "retur · {{returnNumber}}",
    },
    // Approved
    {
      key: "approved_headline",
      label: "APROBAT — titlu",
      kind: "input",
      defaultValue: "Cererea de retur e aprobată.",
    },
    {
      key: "approved_body",
      label: "APROBAT — text",
      kind: "textarea",
      defaultValue:
        "Am aprobat cererea ta de retur. Următorul pas: trimiți coletul înapoi la Buciumeni. Îți vom trimite instrucțiuni de expediere separat sau te contactăm telefonic în următoarele 24h.",
    },
    // In transit
    {
      key: "in_transit_headline",
      label: "ÎN TRANSPORT — titlu",
      kind: "input",
      defaultValue: "Coletul de retur e pe drum.",
    },
    {
      key: "in_transit_body",
      label: "ÎN TRANSPORT — text",
      kind: "textarea",
      defaultValue:
        "Am marcat coletul de retur ca fiind în transport. Așteptăm să ajungă la noi și apoi te anunțăm când e verificat.",
    },
    // Completed
    {
      key: "completed_headline",
      label: "FINALIZAT — titlu",
      kind: "input",
      defaultValue: "Returul e finalizat.",
    },
    {
      key: "completed_body",
      label: "FINALIZAT — text",
      kind: "textarea",
      defaultValue:
        "Am procesat returul complet. Dacă ai ales rambursare, banii au plecat spre tine (vezi emailul separat cu detaliile). Dacă ai ales înlocuire sau voucher, primești confirmarea corespunzătoare.",
    },
    // Rejected
    {
      key: "rejected_headline",
      label: "RESPINS — titlu",
      kind: "input",
      defaultValue: "Cererea de retur nu a fost aprobată.",
    },
    {
      key: "rejected_body",
      label: "RESPINS — text",
      kind: "textarea",
      defaultValue:
        "După verificare, cererea ta nu a putut fi aprobată. Motivul e adesea legat de termenul de 14 zile de la livrare (OUG 34/2014) sau de starea produsului. Dacă vrei mai multe detalii sau contești decizia, scrie-ne la contact@domeniul-locus.ro.",
    },
    {
      key: "footnote",
      label: "Notă finală (comună tuturor)",
      kind: "textarea",
      defaultValue:
        "Vezi statusul în orice moment în contul tău sau răspunde la acest email dacă ai întrebări.",
    },
  ],
  sampleVariables: {
    returnNumber: "RET-2026-042",
    orderNumber: "LC26071500001",
    customerName: "Andrei",
  },
};

// ─── Newsletter welcome ────────────────────────────────────────
export const NEWSLETTER_WELCOME: EmailTemplateDef = {
  key: "newsletter_welcome",
  name: "Bun venit newsletter",
  description: "Trimis la signup din footer.",
  destination: "client",
  variables: [],
  subject: "Bun venit la Domeniul Locus",
  blocks: [
    {
      key: "eyebrow",
      label: "Eyebrow",
      kind: "input",
      defaultValue: "bun venit",
    },
    {
      key: "greeting",
      label: "Titlu mare",
      kind: "input",
      defaultValue: "Locul, în cuvinte.",
    },
    {
      key: "para_1",
      label: "Paragraf 1",
      kind: "textarea",
      defaultValue:
        "Mulțumim că te alături. De aici încolo, vei primi notițe rare din vie și pivniță — recolte, ediții limitate înainte să apară pe site, invitații la degustări la sediul din Buciumeni.",
    },
    {
      key: "para_2",
      label: "Paragraf 2",
      kind: "textarea",
      defaultValue:
        "Trimitem doar când chiar avem ce povesti. Te poți dezabona oricând — orice email va avea un link discret la subsol.",
    },
    {
      key: "para_3",
      label: "Paragraf 3 (cu link către shop)",
      kind: "textarea",
      defaultValue:
        "Între timp, vinurile sunt aici: https://domeniul-locus.ro/shop",
    },
  ],
  sampleVariables: {},
};

// ─── Registry ────────────────────────────────────────────────────
// Toate template-urile pe care admin le poate edita.
// admin_order_notification (către tine) NU e aici — rămâne cu textul din cod
// pentru că e email intern, nu de brand.
export const ALL_EMAIL_TEMPLATES: readonly EmailTemplateDef[] = [
  ORDER_CONFIRMATION,
  SHIPPED,
  DELIVERED,
  REFUND_CONFIRMATION,
  RETURN_STATUS,
  NEWSLETTER_WELCOME,
];

export function getTemplateDef(key: string): EmailTemplateDef | undefined {
  return ALL_EMAIL_TEMPLATES.find((t) => t.key === key);
}

// ─── Interpolation utility (client-safe) ─────────────────────────
// Înlocuiește {{variable}} cu valoarea din contextul dat. Missing vars →
// string gol (curățăm și punctuația/whitespace-ul dublu rezultat).
export function interpolate(
  template: string,
  vars: Record<string, string | number | null | undefined>,
): string {
  return template
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) => {
      const v = vars[name];
      if (v === null || v === undefined || v === "") return "";
      return String(v);
    })
    .replace(/\s+([,.:;!?])/g, "$1") // "text , foo" → "text, foo"
    .replace(/,\s*\./g, ".") // "Mulțumim,." → "Mulțumim."
    .replace(/\s{2,}/g, " ") // dublu spațiu → simplu
    .trim();
}
