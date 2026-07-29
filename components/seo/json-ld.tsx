/**
 * Structured data (schema.org JSON-LD).
 *
 * De ce contează concret:
 *  - Google Merchant Center validează prețul și disponibilitatea din feed
 *    comparându-le cu markup-ul Product/Offer de pe pagina produsului.
 *    Fără markup, feed-ul poate fi suspendat cu „mismatched price/availability".
 *  - Rich results în căutare (preț, stoc, breadcrumb) → CTR mai bun organic.
 *
 * Serializarea: `JSON.stringify` poate produce `</script>` dacă un câmp
 * conține text HTML. Escapăm `<` ca să nu se poată închide tag-ul devreme.
 */

type JsonLdObject = Record<string, unknown>;

function serialize(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
