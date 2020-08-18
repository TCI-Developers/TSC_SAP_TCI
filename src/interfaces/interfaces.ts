export interface Proveedores {
  LIFNR: string;
  LAND1: string;
  NAME1: string;
  NAME2: string;
  ORT01: string;
  EKORG: string;
  ZTERM: string;
  KALSK: string;
}

export interface Responses {
  data: Datum[];
  fields: Field[];
  metadata: Metadata;
}

export interface Metadata {
  numFields: number;
  numRecords: number;
  skip: number;
  totalRecords: number;
}

export interface Field {
  id: number;
  label: string;
  type: string;
}

export interface Datum {
  '29': _29;
  '51': _51;
  '58': _51;
  '74': _29;
  '651': _651;
  '657': _51;
  '667': _651;
  '669': _51;
}

export interface _651 {
  value: string[];
}

export interface _51 {
  value: string;
}

export interface _29 {
  value: number;
}