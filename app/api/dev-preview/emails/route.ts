import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { loadTemplate, previewTemplate } from "@/lib/email/render";
import { ALL_EMAIL_TEMPLATES } from "@/lib/email/schema";
import {
  adminOrderNotificationHtml,
  type OrderConfirmationData,
} from "@/lib/email/templates";

/**
 * GET /api/_dev/emails — toate emailurile într-o singură pagină.
 *
 * Randează prin exact același cod care trimite: textele vin din
 * `email_templates` (DB), nu din valorile implicite, iar structura vine
 * din assembler-ele reale. Ce vezi aici e ce primește clientul.
 *
 * Fiecare email stă într-un iframe — HTML-ul de email are propriile
 * `<html>`/`<body>` și s-ar bate cap în cap cu pagina gazdă.
 *
 * Doar în development. În producție răspunde 404, ca să nu expunem
 * conținutul comercial și adresele interne.
 */
export const dynamic = "force-dynamic";

const SAMPLE_ORDER: OrderConfirmationData = {
  orderNumber: "LC26082000042",
  customerName: "Andrei",
  items: [
    { name: "Fetească Neagră", code: "LC02", qty: 2, unitPriceRon: 119 },
    { name: "Riesling Italian", code: "LS04", qty: 1, unitPriceRon: 58 },
  ],
  subtotalRon: 296,
  shippingRon: 0,
  discountRon: 29,
  totalRon: 267,
  shippingMethod: "curier",
  shippingAddress: "Str. Exemplu 12, București, Ilfov",
  paymentMethod: "card-online",
};

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const cards: string[] = [];

  for (const def of ALL_EMAIL_TEMPLATES) {
    let subject = def.subject;
    let html = "";
    try {
      // Blocurile salvate din admin, nu defaults — asta pleacă în realitate.
      const loaded = await loadTemplate(def.key);
      const rendered = previewTemplate(def.key, loaded.blocks, loaded.subject);
      subject = rendered.subject;
      html = rendered.html;
    } catch (err) {
      html = `<pre style="font:12px monospace;color:#a33;padding:20px;">Nu am putut randa ${def.key}:\n${String(err)}</pre>`;
    }
    cards.push(card(def.name, def.key, subject, def.description, html));
  }

  // Notificarea internă — hardcodată în cod, nu editabilă din admin.
  const adminTpl = adminOrderNotificationHtml({
    ...SAMPLE_ORDER,
    customerEmail: "andrei@exemplu.ro",
    customerPhone: "07xx xxx xxx",
  });
  cards.push(
    card(
      "Comandă nouă (către tine)",
      "admin_order_notification",
      adminTpl.subject,
      "Notificare internă. Nu e editabilă din admin — textul stă în cod.",
      adminTpl.html,
    ),
  );

  /* Emailurile de autentificare nu trec prin Resend și nici prin codul de
     mai sus: sunt fișiere lipite manual în dashboard-ul Supabase, care le
     trimite el. Le citim de pe disc și înlocuim variabilele Go cu valori
     de probă, ca să se vadă lângă restul. */
  for (const auth of AUTH_TEMPLATES) {
    let html: string;
    try {
      const raw = await readFile(
        path.join(process.cwd(), "supabase", "email-templates", auth.file),
        "utf8",
      );
      html = raw
        .replaceAll("{{ .ConfirmationURL }}", "https://www.domeniul-locus.ro/auth/callback?token=exemplu")
        .replaceAll("{{ .Email }}", "andrei@exemplu.ro")
        .replaceAll("{{ .NewEmail }}", "andrei.nou@exemplu.ro");
    } catch (err) {
      html = `<pre style="font:12px monospace;color:#a33;padding:20px;">Nu am putut citi ${auth.file}:\n${String(err)}</pre>`;
    }
    cards.push(card(auth.name, auth.file, auth.subject, auth.description, html));
  }

  return new NextResponse(page(cards.join("\n")), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** Șabloanele trimise de Supabase, nu de Resend. Sursa: supabase/email-templates/. */
const AUTH_TEMPLATES = [
  {
    file: "magic-link.html",
    name: "Autentificare (magic link)",
    subject: "Linkul tău de autentificare",
    description: "Supabase · la login fără parolă. Lipit manual în dashboard.",
  },
  {
    file: "confirm-signup.html",
    name: "Confirmare cont nou",
    subject: "Confirmă-ți adresa",
    description: "Supabase · la crearea contului.",
  },
  {
    file: "reset-password.html",
    name: "Resetare parolă",
    subject: "Resetare parolă",
    description: "Supabase · la cerere de resetare.",
  },
  {
    file: "change-email.html",
    name: "Schimbare adresă de email",
    subject: "Confirmă noua adresă",
    description: "Supabase · când clientul își schimbă emailul din cont.",
  },
  {
    file: "invite-user.html",
    name: "Invitație",
    subject: "Invitație",
    description: "Supabase · invitație trimisă din dashboard.",
  },
] as const;

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function card(
  name: string,
  key: string,
  subject: string,
  description: string,
  html: string,
): string {
  return `
  <section class="card" id="${esc(key)}">
    <header>
      <div class="name">${esc(name)}</div>
      <div class="meta"><span class="k">${esc(key)}</span> · ${esc(description)}</div>
      <div class="subject"><span>subiect</span> ${esc(subject)}</div>
    </header>
    <iframe loading="lazy" srcdoc="${esc(html)}"></iframe>
  </section>`;
}

function page(body: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Toate emailurile · Domeniul Locus</title>
<style>
  :root { color-scheme: light; }
  body { margin:0; background:#e4ded6; font-family:'IBM Plex Mono',ui-monospace,monospace; }
  .top { padding:32px 20px 8px; text-align:center; }
  .top h1 { font-family:Georgia,serif; font-weight:400; font-size:30px; margin:0 0 8px; color:#1a1a1a; }
  .top p { margin:0 auto; max-width:620px; font-size:11px; line-height:1.9; color:#6e5e4b; }
  nav { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; padding:18px 20px 6px; }
  nav a { font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:#4a3c2d;
          text-decoration:none; border:1px solid rgba(74,60,45,.22); padding:7px 11px; background:#faf9f6; }
  nav a:hover { background:#1a1a1a; color:#faf9f6; border-color:#1a1a1a; }
  .card { max-width:760px; margin:34px auto; background:#faf9f6; border:1px solid rgba(74,60,45,.16); }
  .card header { padding:18px 22px; border-bottom:1px solid rgba(74,60,45,.16); }
  .name { font-family:Georgia,serif; font-size:21px; color:#1a1a1a; }
  .meta { font-size:10px; letter-spacing:.1em; color:#8a7c68; margin-top:6px; }
  .meta .k { color:#8b7841; }
  .subject { font-size:11.5px; color:#1a1a1a; margin-top:12px; line-height:1.6; }
  .subject span { font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:#8a7c68; margin-right:8px; }
  iframe { display:block; width:100%; height:920px; border:0; background:#fff; }
</style>
</head>
<body>
  <div class="top">
    <h1>Toate emailurile</h1>
    <p>Randate prin codul real: textele vin din baza de date, structura din assembler-ele care trimit.
       Datele de comandă sunt fictive. Pagina merge doar în development.</p>
  </div>
  <nav>
    <a href="#order_confirmation">confirmare comandă</a>
    <a href="#shipped">expediată</a>
    <a href="#delivered">livrată</a>
    <a href="#refund_confirmation">rambursare</a>
    <a href="#return_status">retur</a>
    <a href="#newsletter_welcome">bun venit + cod</a>
    <a href="#admin_order_notification">comandă nouă (intern)</a>
    <a href="#magic-link.html">magic link</a>
    <a href="#confirm-signup.html">confirmare cont</a>
    <a href="#reset-password.html">resetare parolă</a>
    <a href="#change-email.html">schimbare email</a>
    <a href="#invite-user.html">invitație</a>
  </nav>
  ${body}
</body>
</html>`;
}
