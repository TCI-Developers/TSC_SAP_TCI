export interface Proveedores {
  LIFNR: string;
  LAND1: string;
  NAME1: string;
  NAME2: string;
  ORT01: string;
  EKORG: string;
  ZTERM: string;
  KALSK: string;
  J_1KFTIND  :string;
  TEXT        :string;
}

export interface Forecast {
  MATNR: string;
  MAKTX: string;
  MENGE: string;
  MEINS: string;
  VBELN: string;
  POSNR: string;
  PLNUM: string;
  DAT00: string;
  EXTRA: string;                        
  DELB0: string;                          
  KUNNR: string;                          
  MD4KD: string;                          
  UMDAT: string;                          
 
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
  J_1KFTIND   :string;
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

export interface KPICostosCortes {
  Sagarpa            : number | string;
  Huerta             : number | string;
  Acuerdo            : number | string;
  Detalle_corte      : number | string;
  Proveedor          : number | string;
  Productor          : number | string;
  Fecha              : number | string;
  Kilos_recibidos    : number | string;
  Monto              : number | string;
  Ordenes_cuadrillas : number | string;
  Ordenes_fletes     : number | string;



}

export interface Toneladas {
  Fecha              : number | string;
  Kilos_recibidos    : number | string;
  Huerta             : number | string;
  Lote               : number | string;
  Kilos_empaque      : number | string;
  Kilos_proveedor    : number | string;
  Ordenes_cuadrillas : number | string;
  Ordenes_fletes     : number | string;
 

}
export interface Corrida {
  Acuerdo : number | string;
  Fecha_Corte : number | string;
  Detalles_Acuerdo : number | string;
  Lote : number | string;
  Orden_agranel : number | string;
  Sagarpa : number | string;
  Huerta :  number | string;
  Kilos_agranel : number | string;
  Calibre32 : RCalibres;
  Calibre36 : RCalibres;
  Calibre40 : RCalibres;
  Calibre48 : RCalibres;
  Calibre60 : RCalibres;
  Calibre70 : RCalibres;
  Calibre84 : RCalibres;
  Calibre32B : RCalibres;
  Calibre36B : RCalibres;
  Calibre40B : RCalibres;
  Calibre48B : RCalibres;
  Calibre60B : RCalibres;
  Calibre70B : RCalibres;
  Calibre84B : RCalibres;
  Categoria1 : Categorias;
  Categoria2 : Categorias;
  Nacional : Categorias;
  Canica : Categorias;

}


export interface Categoria1 {
  Acuerdo : number | string;
  Fecha_Corte : number | string;
  Detalles_Acuerdo : number | string;
  Lote : number | string;
  Orden_agranel : number | string;
  Sagarpa : number | string;
  Huerta :  number | string;
  Kilos_agranel : number | string;
  Calibre32 : RCalibres;
  Calibre36 : RCalibres;
  Calibre40 : RCalibres;
  Calibre48 : RCalibres;
  Calibre60 : RCalibres;
  Calibre70 : RCalibres;
  Calibre84 : RCalibres;
  Categoria1 : Categorias;
  Categoria2 : Categorias;
  Nacional : Categorias;
  Canica : Categorias;

}



export interface RCalibres {
  
  Visita: number;
  Corrida: number;
  Error: number;
  Material: string;
  Descripcion: string;
  
}


export interface Categorias {
  
  Visita: number;
  Corrida: number;
  Error: number;

  
}


export interface KPICostos {
  data:     { [key: string]: Valor }[];
 
}

export interface ToneladasRecibidas {
  data:     { [key: string]: Valor }[];
 
}

 interface Valor {
  value: number | string;
}

export interface ResponseQuick {
  data:     { [key: string]: Data }[];
 
}

 interface Data {
  value: number | string;
}

export interface Huertas {
  
  Nombre    : number | string;
  Localidad : number | string;
  Sagarpa   : number | string;
  Municipio : number | string;
  Organico  : number | string;
 }






 