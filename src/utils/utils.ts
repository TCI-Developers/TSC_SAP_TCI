import { XMLHttpRequest } from 'xmlhttprequest';
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";

export const headers = {
    'QB-Realm-Hostname': 'aortizdemontellanoarevalo.quickbase.com',
    'User-Agent': 'Acuerdos',
    'Authorization': 'QB-USER-TOKEN b4czas_fwjc_3v7g2fym488vcr4zujjdx7tdax',
    'Content-Type': 'application/json'
  }

  export function createXHR() {
      return new XMLHttpRequest();
  }

  export const Tables = {
    "T_Productor_prod"  : "bqdcp8k48",
    "T_Productor_test"  : "brxztykxb",

    "T_Cuadrillas_prod" : "bqdcp8k4f",
    "T_Cuadrillas_test" : "brxztykw3",

    "T_Transportes_prod" : "bqmyekd8t",
    "T_Transportes_test" : "brxztymz8",

    "T_Acuerdos_prod" : "bqdcp8fbc",
    "T_Acuerdos_test" : "brxztykut",

    "T_Detalle_Huerta_prod" : "bqhds58u2",
    "T_Detalle_Huerta_test" : "brxztymzw",

    "T_Detalle_Acuerdo_prod" : "bqdcp8ghy",
    "T_Detalle_Acuerdo_test" : "brxztykvq",

    "T_Embarques_prod" : "bqdcp865h",
    "T_Embarques_test" : "brxztymya",

    "T_Det_Embarques_prod" : "bqdcp865m",
    "T_Det_Embarques_test" : "brxztymyg",

    "T_Productos_prod" : "bqdcp8nhd",
    "T_Productos_test" : "brxztyk2t",

    "T_Benefeciarios_prod" : "bqdcp8m24",
    "T_Benefeciarios_test" : "brxztykzk",

    "T_Detalle_Corte_prod" : "bqdcp8je5",
    "T_Detalle_Corte_test" : "brxztykwr",

    "T_Materiales_prod" : "bqrxem5py",
    "T_Materiales_test" : "brxztym2h",

    "T_Ordenes_Fletes_prod" : "brudn49pu",
    "T_Ordenes_Fletes_test" : "brxztym4t",

    "T_Picking_prod" : "bq2942w6n",
    "T_Picking_test" : "brxztym3r",

    "T_Resultado_Corrida_prod" : "brhh5xmxa",
    "T_Resultado_Corrida_test" : "brxztym4k",

    "T_Precios_Banda_prod" : "bqr9nfpuk",
    "T_Precios_Banda_test" : "brxztym2j",

    "T_Ventas_prod" : "bqzqzavaz",
    "T_Ventas_test" : "brxztym24",

    "T_Lotes_SAP_prod" : "bq82myqch",
    "T_Lotes_SAP_test" : "brxztym37",
  }