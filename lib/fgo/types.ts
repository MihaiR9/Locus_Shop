/**
 * FGO API v7.1 — tipuri comune.
 * Doc: /Integrari/fgo/fgo-api-public-documentatie.pdf
 * Base: https://api-testuat.fgo.ro/v1 (test) | https://api.fgo.ro/v1 (prod)
 */

export type FgoTipClient = "PF" | "PJ";
export type FgoTipFactura = "Factura" | "Proforma" | "Comanda" | "X" | "S";

export type FgoClient = {
  Denumire: string;
  CodUnic?: string; // CUI/CNP
  NrRegCom?: string;
  Email?: string;
  Telefon?: string;
  Tara: string; // "ROMANIA" | "RO" | alt
  Judet?: string; // obligatoriu dacă Tara = RO
  Localitate?: string;
  Adresa?: string;
  Tip: FgoTipClient;
  IdExtern?: number;
  Strain?: boolean;
  ContBancar?: string;
  PlatitorTVA?: boolean;
};

export type FgoContinutItem = {
  Denumire: string;
  CodArticol?: string;
  CodGestiune?: string;
  Descriere?: string;
  PretUnitar?: number;
  PretTotal?: number;
  UM: string;
  NrProduse: number;
  CotaTVA: number;
  CodCentruCost?: string;
};

export type FgoEmitereRequest = {
  CodUnic: string;
  Hash: string;
  Text?: string;
  Explicatii?: string;
  Valuta: string; // "RON"
  TipFactura: FgoTipFactura;
  DataEmitere?: string; // yyyy-mm-dd
  DataScadenta?: string;
  Numar?: string;
  Serie: string;
  TvaLaIncasare?: boolean;
  VerificareDuplicat?: boolean;
  ValideazaCodUnicRo?: boolean;
  IdExtern?: string;
  Client: FgoClient;
  Continut: FgoContinutItem[];
  PlatformaUrl: string;
};

export type FgoEmitereResponse =
  | {
      Success: true;
      Message?: string;
      Factura: {
        Numar: string;
        Serie: string;
        Link: string;
        LinkPlata?: string;
      };
      InfoStoc?: Array<{ CodConta: string; Nume: string; Stoc: number }>;
    }
  | { Success: false; Message: string };

export type FgoSimpleResponse =
  | { Success: true; Message?: string }
  | { Success: false; Message: string };

export type FgoPrintResponse =
  | {
      Success: true;
      Message?: string;
      Factura: { Numar: string; Serie: string; Link: string };
    }
  | { Success: false; Message: string };

export type FgoStatusResponse =
  | {
      Success: true;
      Factura: {
        Numar: string;
        Serie: string;
        Valoare: string;
        ValoareAchitata: string;
        Incasari?: Array<{
          SumaIncasata: number;
          DataIncasare: string;
          Valuta: string;
        }>;
      };
    }
  | { Success: false; Message: string };
