# Șabloane de email Supabase Auth

Emailurile de autentificare (magic link, confirmare cont, resetare parolă)
**nu** trec prin Resend și nu sunt generate de `lib/email/templates.ts`. Le
trimite Supabase, din propriile lui șabloane.

De asta arătau ca implicitul Supabase — text negru pe alb, fără logo — în
timp ce emailurile de comandă erau în identitatea brandului.

## Cum se aplică

Fișierele de aici **nu se încarcă automat**. Se copiază manual:

1. Supabase Dashboard → **Authentication** → **Emails** → **Templates**
2. Alege șablonul (ex. *Magic Link*)
3. Lipește conținutul fișierului corespunzător în câmpul de HTML
4. Subiect recomandat pentru magic link: `Autentificare · Domeniul Locus`
5. Save

Le ținem în repo ca să existe o singură versiune de adevăr și ca
modificările să se vadă în istoric — dashboard-ul nu are versionare.

## Fișiere și unde se pun

| Fișier | Șablonul din dashboard | Subiect propus |
|---|---|---|
| `magic-link.html` | Magic Link | `Autentificare · Domeniul Locus` |
| `confirm-signup.html` | Confirm signup | `Confirmă-ți adresa · Domeniul Locus` |
| `reset-password.html` | Reset password | `Resetare parolă · Domeniul Locus` |
| `change-email.html` | Change email address | `Confirmă adresa nouă · Domeniul Locus` |
| `invite-user.html` | Invite user | `Ai un cont pregătit · Domeniul Locus` |

## Variabile disponibile

Supabase folosește templating Go. Cele utile:

| Variabilă | Ce conține |
|---|---|
| `{{ .ConfirmationURL }}` | linkul de acțiune, complet |
| `{{ .Email }}` | adresa destinatarului (la *change email*: adresa **veche**) |
| `{{ .NewEmail }}` | adresa **nouă** — există doar la *Change email address* |
| `{{ .Token }}` | codul de 6 cifre, dacă preferi OTP în loc de link |
| `{{ .SiteURL }}` | URL-ul configurat în proiect |

`{{ .NewEmail }}` e singura variabilă care nu e disponibilă peste tot. Dacă
o folosești din greșeală în alt șablon, iese gol — fără eroare, doar un
rând care nu spune nimic.

## Despre resetarea parolei

Autentificarea clienților e pe **magic link, fără parolă**, deci șablonul
de reset nu se declanșează în fluxul normal. Îl ținem completat pentru
cazul în care se activează parolele, și pentru conturile de admin dacă
vor fi vreodată create cu parolă. Un email urât trimis rar e tot un email
urât.

## ⚠️ Logo-ul

`magic-link.html` referă logo-ul ca URL absolut:

```
https://www.domeniul-locus.ro/brand/logo-locus.png
```

Emailurile nu pot folosi căi relative — clientul de mail nu știe de pe ce
domeniu vine mesajul. Două consecințe:

- **Domeniul trebuie să fie cel real.** Dacă schimbi domeniul, actualizează
  și aici.
- **Fișierul trebuie să fie public.** `proxy.ts` lasă `/brand` accesibil
  chiar și cu `COMING_SOON=true`, deci merge și înainte de lansare. Dacă
  cineva strânge whitelist-ul, logo-ul dispare din emailuri fără niciun
  semn în aplicație.

Testând local nu vei vedea logo-ul: `localhost` nu e accesibil din
clientul de mail al destinatarului.

## Fonturi

`Italiana` nu se încarcă în Gmail, Outlook sau Apple Mail — clienții de
email nu suportă fonturi web. Declarația are fallback pe Georgia, deci
titlurile ies cu serif de sistem. E același compromis ca în restul
emailurilor noastre, asumat.

## De făcut

Doar *Magic Link* e refăcut. Aceleași tratament merită și:
- **Confirm signup** — la crearea contului
- **Change email address**
- **Reset password** — dacă activezi vreodată parolele (acum e doar magic link)
