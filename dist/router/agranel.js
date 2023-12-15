"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const path_1 = __importDefault(require("path"));
const pathViews = path_1.default.resolve(__dirname, '../views');
const agranel = (0, express_1.Router)();
agranel.get('/agranel/:record/:type', (req, res) => {
    const record = req.params.record;
    const type = req.params.type;
    let table = '';
    let tableSAP = '';
    let tableAcuerdo = '';
    let client = null;
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem),
            table = String(utils_1.Tables.T_Detalle_Huerta_prod),
            tableAcuerdo = String(utils_1.Tables.T_Detalle_Acuerdo_prod),
            tableSAP = String(utils_1.Tables.T_Lotes_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest),
                table = String(utils_1.Tables.T_Detalle_Huerta_test),
                tableAcuerdo = String(utils_1.Tables.T_Detalle_Acuerdo_test),
                tableSAP = String(utils_1.Tables.T_Lotes_SAP_test)) : null;
    const body = {
        "from": table,
        "select": [54, 53, 52, 51, 32, 15, 6, 8, 24, 55, 3, 58, 59, 68, 69],
        "where": `{15.EX.${record}}`
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.first)(), (0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'data')).subscribe((resp) => {
        for (const iterator of resp) {
            let recordHuerta = iterator['3']['value'];
            let IT_DATA = {
                'I_FECHA_CORTE': iterator['54']['value'],
                'I_FACTURADOR': iterator['53']['value'] || "",
                'I_PROVEEDOR': iterator['52']['value'],
                'I_IDCORTE': String(iterator['51']['value']),
                'CENTRO': iterator['68']['value'],
                'ORG_COMPRAS': iterator['69']['value'],
                'IT_DATA': [{
                        'MATERIAL': "000000006000000030",
                        'CANTIDAD': Number(iterator['32']['value']).toFixed(2),
                        'LOTE_PROV': String(iterator['15']['value']) || "",
                        'PROVEEDOR': iterator['52']['value'],
                        'ALMACEN': "",
                        'NO_HUERTA': iterator['6']['value'],
                        'NOM_HUERTA': iterator['8']['value'],
                        'AGRICULTOR': iterator['24']['value'],
                        'TIPO_FRUTA': iterator['55']['value'][0],
                        'CORTE_FRUTA': iterator['58']['value'],
                        'TIPO_CORTE': iterator['59']['value']
                    }]
            };
            client.connect((result, err) => {
                client.invoke("Z_RFC_VA_ENTRADAAGRANEL", IT_DATA, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
                    err ? res.json(err) : null;
                    String(result['E_ORDEN_COMPRA']).length > 0 ? postOrdenCompraTCI(res, result, recordHuerta, table, tableSAP) : res.render(`${pathViews}/flotillas.hbs`, { tipo: 'WARNING', respuesta: result['IT_MESSAGE_WARNING'] }); // res.json(result['IT_MESSAGE_WARNING']);
                }));
            });
        }
    });
});
function postBanderaTCI(res, result, record, tableAcuerdo) {
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to": tableAcuerdo,
        "data": [{
                "1038": { "value": true },
                "3": { "value": record }
            }]
    };
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(5), (0, operators_1.pluck)('response', 'metadata')).subscribe(resp => res.json({ SAP: result['IT_MENSAJE_EXITOSOS'], TCI: resp }), err => res.json(err.response));
}
function postOrdenCompraTCI(res, result, record, table, tableSAP) {
    const url = 'https://api.quickbase.com/v1/records';
    const lote = result.IT_MENSAJE_EXITOSOS[2].MESSAGE.split(" ");
    const args = {
        "to": table,
        "data": [{
                "3": { "value": record },
                "35": { "value": result.E_ORDEN_COMPRA },
                "61": { "value": lote[5] }
            }]
    };
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1)).subscribe(resp => postLoteSAP(res, lote[2], record, result, tableSAP), err => res.json(err.response));
}
const postLoteSAP = (res, lote, record, result, tableSAP) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to": tableSAP,
        "data": [{
                "6": { "value": lote },
                "7": { "value": record }
            }]
    };
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(1)).subscribe(resp => res.render(`${pathViews}/flotillas.hbs`, { tipo: 'EXITO', respuesta: result['IT_MENSAJE_EXITOSOS'] }), err => res.json(err.response));
    //subscribe(resp =>  res.json({SAP: result['IT_MENSAJE_EXITOSOS'], TCI: resp.response.metadata }), err => res.json(err.response) );
});
exports.default = agranel;
