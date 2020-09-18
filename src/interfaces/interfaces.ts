export interface Proveedores {
  LIFNR: string;
  LAND1: string;
  NAME1: string;
  NAME2: string;
  ORT01: string;
  EKORG: string;
  ZTERM: string;
  KALSK: string;
  IND_SECTOR  :string;
  TEXT        :string;
}

export interface Cuadrillas {
  LIFNR       :string;
  LAND1       :string;
  NAME1       :string;
  NAME2       :string;
  ORT01       :string;
  EKORG       :string;
  ZTERM       :string;
  KALSK       :string;
  IND_SECTOR  :string;
  TEXT        :string;
}

export interface Facturadores {
  LIFNR: string;
  LAND1: string;
  NAME1: string;
  NAME2: string;
  ORT01: string;
  EKORG: string;
  LIFN2: string;
  PARVW: string;
  DEFPA: string;
}

export interface Materiales {
  MATNR :string;
  MTART :string;
  MATKL :string;
  MEINS :string;
  BRGEW :string;
  NTGEW :string;
  SPRAS :string;
  MAKTX :string;
  MAKTG :string;
}

export interface Acuerdo {
  '29': _29;
  '667': _667;
  '669': _669;
  '675': _669;
  '676': _676;
  '677': _669;
}

export interface _676 {
  value: Value;
}

export interface Value {
  email: string;
  id: string;
}

export interface _669 {
  value: string;
}

export interface _667 {
  value: string[];
}

export interface _29 {
  value: number;
}