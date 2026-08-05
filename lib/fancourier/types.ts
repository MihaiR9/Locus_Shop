/**
 * FanCourier API v2 (mai 2023) — tipuri comune.
 * Doc: /Integrari/Fancourier/RO_FANCourier_API-2.0-100523.pdf
 * Base URL: https://api.fancourier.ro
 */

/** Serviciile FC pe care le oferim la checkout. Numele = ce trimitem în API. */
export type FanCourierService =
  | "Standard"
  | "FANbox"
  | "CollectPoint"
  | "Cont Colector"; // pentru ramburs (nu-l oferim public, dar e util în viitor

export type FanCourierPickupType = "fanbox" | "paypoint" | "office";

export type FanCourierAddress = {
  county: string;
  locality: string;
  street: string;
  streetNo: string;
  /** Doar pentru FANbox / PayPoint — id-ul locker-ului sau al punctului. */
  pickupLocation?: string;
  zipCode?: string;
};

export type FanCourierRecipient = {
  name: string;
  phone: string;
  email?: string;
  address: FanCourierAddress;
};

export type FanCourierPackages = {
  parcel: number;
  envelopes: number;
};

export type FanCourierDimensions = {
  length: number; // cm
  height: number; // cm
  width: number; // cm
};

export type FanCourierShipmentInfo = {
  service: FanCourierService;
  packages: FanCourierPackages;
  /** Greutate în kg. */
  weight: number;
  /** COD (ramburs) în lei. 0 dacă e plătit online. */
  cod?: number;
  /** Valoare declarată în lei (pentru asigurare). */
  declaredValue?: number;
  /** "sender" (noi plătim) sau "recipient" (client plătește curierul). */
  payment: "sender" | "recipient";
  refund?: string | null;
  returnPayment?: string | null;
  /** Text liber pe eticheta — vezi tot pe eticheta printată. */
  observation: string;
  /** Ex: "Comanda #LC123". */
  content?: string;
  dimensions: FanCourierDimensions;
  costCenter?: string | null;
  /** Concatenare litere opțiuni. Vezi PDF pag. 9-10.
   *  V=PickUp locker, W=DropOff locker, X=ePOD, F=PayPoint, S=livrare sambata, etc. */
  options?: string[];
};

export type FanCourierShipment = {
  info: FanCourierShipmentInfo;
  recipient: FanCourierRecipient;
};

/** Response de la /awb/internal-tariff */
export type FanCourierTariffResponse = {
  extraKmCost: number;
  weightCost: number;
  insuranceCost: number;
  optionsCost: number;
  fuelCost: number;
  costNoVAT: number;
  vat: number;
  total: number;
};

/** Punct PUDO (FANbox / PayPoint / office) — response `/reports/pickup-points`. */
export type FanCourierPickupPoint = {
  id: string;
  name: string;
  routingLocation: string;
  description: string;
  address: {
    locality: string;
    county: string;
    street: string;
    streetNo: string;
    zipCode: string;
    floor: string;
    reference: string;
  };
  latitude: string;
  longitude: string;
  schedule?: Array<{ firstHour: string; secondHour: string }>;
  drawer?: Array<{ type: "S" | "M" | "L"; number: number }>;
};

/** Response generic pentru majoritatea endpoint-urilor. */
export type FanCourierResponse<T> = {
  status: "success" | "error";
  data: T;
  message?: string;
};
