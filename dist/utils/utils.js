"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codigosExito = exports.mensajesAcuerdo = exports.Tables = exports.createXHR = exports.headers = void 0;
const { XMLHttpRequest } = require('xmlhttprequest');
exports.headers = {
    'QB-Realm-Hostname': 'aortizdemontellanoarevalo.quickbase.com',
    'User-Agent': 'Acuerdos',
    'Authorization': 'QB-USER-TOKEN b4czas_fwjc_3v7g2fym488vcr4zujjdx7tdax',
    'Content-Type': 'application/json'
};
function createXHR() {
    return new XMLHttpRequest();
}
exports.createXHR = createXHR;
exports.Tables = {
    "T_Productor_prod": "bqdcp8k48",
    "T_Productor_test": "brxztykxb",
    "T_Cuadrillas_prod": "bqdcp8k4f",
    "T_Cuadrillas_test": "brxztykw3",
    "T_Transportes_prod": "bqmyekd8t",
    "T_Transportes_test": "brxztymz8",
    "T_Acuerdos_prod": "bqdcp8fbc",
    "T_Acuerdos_test": "brxztykut",
    "T_Detalle_Huerta_prod": "bqhds58u2",
    "T_Detalle_Huerta_test": "brxztymzw",
    "T_Detalle_Acuerdo_prod": "bqdcp8ghy",
    "T_Detalle_Acuerdo_test": "brxztykvq",
    "T_Embarques_prod": "bqdcp865h",
    "T_Embarques_test": "brxztymya",
    "T_Det_Embarques_prod": "bqdcp865m",
    "T_Det_Embarques_test": "brxztymyg",
    "T_Productos_prod": "bqdcp8nhd",
    "T_Productos_test": "brxztyk2t",
    "T_Benefeciarios_prod": "bqdcp8m24",
    "T_Benefeciarios_test": "brxztykzk",
    "T_Detalle_Corte_prod": "bqdcp8je5",
    "T_Detalle_Corte_test": "brxztykwr",
    "T_Materiales_prod": "bqrxem5py",
    "T_Materiales_test": "brxztym2h",
    "T_Ordenes_Fletes_prod": "brudn49pu",
    "T_Ordenes_Fletes_test": "brxztym4t",
    "T_Picking_prod": "bq2942w6n",
    "T_Picking_test": "brxztym3r",
    "T_Resultado_Corrida_prod": "brhh5xmxa",
    "T_Resultado_Corrida_test": "brxztym4k",
    "T_Precios_Banda_prod": "bqr9nfpuk",
    "T_Precios_Banda_test": "brxztym2j",
    "T_Ventas_prod": "bqzqzavaz",
    "T_Ventas_test": "brxztym24",
    "T_Lotes_SAP_prod": "bq82myqch",
    "T_Lotes_SAP_test": "brxztym37",
    "T_Forecast_SAP_prod": "bsr5uqier",
    "T_Forecast_SAP_test": "bsk5gasgk",
    "T_KPICostos_SAP_prod": "bqhds58u2",
    "T_KPICostos_SAP_test": "brxztymzw",
    "T_Huertas_SAP_prod": "bqdcp8m3t",
    "T_Huertas_SAP_test": "brxztykzq",
    "T_DetalleA_SAP_prod": "bqdcp8ghy",
    "T_DetalleA_SAP_test": "bqdcp8ghy",
    "T_Precios_SAP_prod": "btv388giq",
    "T_Precios_SAP_test": "btv388giq",
};
exports.mensajesAcuerdo = [
    { acuerdo: { tipo: 'Acuerdo', value: 'No hay acuerdos que mandar' } },
    { fecha: { tipo: 'Fecha', value: 'La fecha no fue enviada' } },
    { usuario: { tipo: 'Usuario', value: 'El usuario no fue enviado' } },
    { proveedor: { tipo: 'Proveedor', value: 'El proveedor no fue enviado' } },
    { operacion: { tipo: 'Operacion', value: 'La operacion no fue enviada' } },
    { precio: { tipo: 'Precio', value: 'El precio no fue enviado' } },
    { moneda: { tipo: 'Moneda', value: 'La moneda no fue enviada' } },
];
exports.codigosExito = [
    { acuerdo: { tipo: '100', value: 'No hay acuerdos que mandar' } },
    { fecha: { tipo: '101', value: 'La fecha no fue enviada' } },
    { usuario: { tipo: '200', value: 'El usuario no fue enviado' } },
    { proveedor: { tipo: '201', value: 'El proveedor no fue enviado' } },
    { operacion: { tipo: '202', value: 'La operacion no fue enviada' } },
    { precio: { tipo: '300', value: 'El precio no fue enviado' } },
    { moneda: { tipo: '301', value: 'La moneda no fue enviada' } },
];
