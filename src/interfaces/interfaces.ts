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

export interface Embalaje {
  PACKNR  : string;
  POBJID  : string;
  CONTENT : string;
}

export interface Venta {
  VBELN : string;
  AUDAT : string;
  VBTYP : string;
  AUART : string;
  VTWEG : string;
  SPART : string;
}

export interface Embarque {
  VBELV : string;
  POSNV : string;
  VBELN : string;
  POSNN : string;
  VBTYP_N : string;
  RFMNG : string;
  MEINS : string;
  ERDAT : string;
}

export interface detallesEmbarque {
  PED_VTA      : string; 
  FEC_VTA      : string; 
  TIPO_VTA     : string; 
  CL_VTA       : string; 
  DISTR        : string; 
  SECTOR       : string; 
  DET_VTA      : string; 
  EMBARQUE     : string;
  DET_EMB      : string; 
  CANT_EMB     : string; 
  UM_EMB       : string; 
  FEC_EMB      : string; 
  UID_PALLET   : string; 
  ID_PALLET    : string; 
  ID_CAJA      : string; 
  CANT_HU      : string; 
  UM_STOCK     : string; 
  MATERIAL     : string; 
  LOTE         : string; 
  STATUS_EMB   : string; 
  STATUS_FAC   : string; 
  MARCA        : string; 
  PRESENTACION : string; 
}

export interface Cliente {
  NAME1 : string;
  CITY1 : string;
  CP    : string;
  CALLE : string;
  NUM   : string;
}