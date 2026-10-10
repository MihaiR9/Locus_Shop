# Google Business Profile — Domeniul Locus

Texte gata de copiat în business.google.com. Totul se completează cu **contul firmei** (office@domeniul-locus.ro), ca Search Console, GA4 și GTM.

Regula de aur: **numele, adresa, telefonul și site-ul identice peste tot** (profil, site, Vivino, Instagram). Asistenții AI și Google leagă sursele după ele.

---

## 1. Date de bază

| Câmp | Ce scrii |
|---|---|
| Nume firmă | `Domeniul Locus` — exact așa, fără „SRL”, fără cuvinte cheie adăugate (Google suspendă profilurile cu nume umplute) |
| Categorie principală | `Cramă` (Winery) |
| Categorii secundare | `Magazin de vinuri` — doar dacă se poate cumpăra și direct la cramă; altfel niciuna |
| Telefon | `+40 752 232 912` |
| Site | `https://www.domeniul-locus.ro` |
| Adresă | **adresa cramei din Buciumeni**, unde se fac degustările — de completat de Mihai |
| Program | „Fără program afișat” sau orele în care se răspunde la telefon; degustările sunt **cu programare** |
| Link programări | `https://www.domeniul-locus.ro/contact` |
| Zonă deservită | România (livrare în toată țara) |
| Data deschiderii | anul în care a început crama — de completat |

> Adresa: pe site, schema organizației folosește acum sediul social din Galați (Str. Portului nr. 20). Dacă profilul primește adresa cramei din Buciumeni, schimbăm și schema de pe site pe aceeași adresă.

---

## 2. Descriere (634 / 750 caractere)

```
Domeniul Locus este o cramă de familie din Buciumeni, județul Galați, la întâlnirea podgoriilor Panciu și Nicorești. Vinurile poartă denumirea de origine controlată DOC-CMD Panciu și sunt făcute din soiurile locului: Fetească Regală, Fetească Neagră și Riesling Italian. Cele două game, cuvinte și semne, pornesc din aceleași parcele; diferă registrul, nu locul. Totul a început cu pasiunea tatălui pentru vie și continuă prin generația următoare. Vinurile se comandă online, cu livrare prin FanCourier în toată România, gratuit peste 250 de lei. Degustările la cramă se fac cu programare. Vânzare doar către persoane de peste 18 ani.
```

---

## 3. Produse (secțiunea „Produse”)

Pentru fiecare: nume, categorie, preț, descriere, link. Poza: din `public/photos/products/feed/` (JPG pe alb).

| Nume | Categorie | Preț | Descriere | Link |
|---|---|---|---|---|
| Fetească Regală LC01 | gama cuvinte | 68 lei | Vin elegant și armonios. Flori albe, fructe galbene coapte, citrice fine, accente discrete de miere. Alb, demisec, 13,5%. | `/vinuri/feteasca-regala-cuvinte` |
| Fetească Neagră LC02 | gama cuvinte | 119 lei | Vin intens și bine definit. Fructe negre coapte, prune uscate, accente fine de condimente. Final persistent. Roșu, demisec, 14,9%. | `/vinuri/feteasca-neagra-cuvinte` |
| Riesling Italian LC04 | gama cuvinte | 68 lei | Vin proaspăt și precis. Citrice, măr verde, accente florale. Aciditate susținută, final răcoritor. Alb, sec, 13%. | `/vinuri/riesling-italian-cuvinte` |
| Fetească Regală LS01 | gama semne | 58 lei | Selecție de parcelă. Flori albe, fructe coapte, miere și citrice. Textură rotundă, final delicat. Alb, demisec, 13,5%. | `/vinuri/feteasca-regala-semne` |
| Riesling Italian LS04 | gama semne | 58 lei | Selecție de parcelă. Citrice, măr verde, accente florale. Aciditate susținută, tensiune precisă. Alb, sec, 13%. | `/vinuri/riesling-italian-semne` |

Linkurile complete încep cu `https://www.domeniul-locus.ro`. Prețurile sunt cele din 10 oct 2026 — dacă se schimbă în admin, se schimbă manual și aici.

---

## 4. Servicii

| Serviciu | Descriere |
|---|---|
| Degustare la cramă | Degustare în Buciumeni, cu programare prealabilă. Programare la telefon sau din pagina de contact. |
| Livrare vin în toată România | Prin FanCourier, la ușă sau în locker FANbox, în 2–4 zile lucrătoare. Gratuit peste 250 de lei. |

---

## 5. Atribute

Bifează doar ce e adevărat: **Comenzi online**, **Livrare**, **Programare necesară** (pentru degustări).

---

## 6. Fotografii

| Tip | Ce încarci |
|---|---|
| Logo | `public/brand/logo-locus.png` |
| Copertă | o fotografie cu dealurile sau amfora (`public/photos/hero/dealuri.jpg`, `public/photos/homepage-amfora.webp`) |
| Produse | cele 4 JPG-uri din `public/photos/products/feed/` |
| Locul | **fotografii reale cu crama, via și sala de degustare** — cele mai importante pentru încredere; de făcut |

---

## 7. Prima postare („Actualizări”)

```
Un loc. Un timp. Un vin.
Vinurile Domeniului Locus, din Buciumeni, se comandă acum online, cu livrare în toată România. Două game, cuvinte și semne, din aceleași parcele DOC-CMD Panciu.
```
Buton: **Comandă online** → `https://www.domeniul-locus.ro/shop`

---

## 8. După creare

- **Verificarea** profilului (cod prin poștă, telefon sau video, cum alege Google) — fără ea profilul nu apare public.
- **Recenzii:** după fiecare comandă livrată, linkul de recenzie (din profil → „Cere recenzii”) poate merge în mailul de livrare. Se răspunde la fiecare recenzie, scurt, în tonul brandului.
- Când profilul e public, linkul lui se adaugă în `sameAs` (`lib/seo/schema.ts`), lângă Instagram.
