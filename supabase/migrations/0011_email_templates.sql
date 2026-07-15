-- Email templates — text content editabil din admin.
-- Structura HTML + stilurile rămân în cod (lib/email/templates.ts).
-- Aici stochează admin doar TEXTELE care se pot personaliza — subject +
-- blocuri de conținut (greeting, intro, footnote etc.).
-- Interpolare {{variabila}} suportată în subject și blocks.
-- Idempotent — safe de rulat de mai multe ori.

create table if not exists email_templates (
  id          uuid primary key default uuid_generate_v4(),
  key         varchar(60) unique not null,
  subject     varchar(300) not null,
  blocks      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists email_templates_key_idx on email_templates (key);

-- ─── RLS ─────────────────────────────────────────────────────────
alter table email_templates enable row level security;

drop policy if exists email_templates_admin_all on email_templates;
create policy email_templates_admin_all on email_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- Public read pentru webhook Stripe (rulează fără sesiune, trebuie să
-- poată citi textele pentru a trimite emailuri). Nu conține date sensibile
-- — doar texte de marketing.
drop policy if exists email_templates_public_read on email_templates;
create policy email_templates_public_read on email_templates
  for select using (true);

-- ─── Trigger updated_at ──────────────────────────────────────────
drop trigger if exists email_templates_updated_at on email_templates;
create trigger email_templates_updated_at
  before update on email_templates
  for each row execute function update_updated_at_column();

-- Seed-ul cu textele curente se face din TypeScript la primul admin visit
-- (lib/admin/email-templates-queries.ts — ensureSeedIfMissing).
-- Motiv: textele default trăiesc în lib/email/schema.ts și trebuie să
-- rămână sincronizate — dacă le-am pus în SQL, s-ar fi divergat.
