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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const agranel = express_1.Router();
agranel.get('/agranel/:record', (req, res) => {
    const record = req.params.record;
    const body = {
        "from": "bqdcp8ghy",
        "select": [1029, 1022, 1021, 1030, 1024, 1028, 1026, 1031, 1032, 1014, 1034],
        "where": `{3.EX.${record}}`
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data')).subscribe(resp => {
        const IT_DATA = {
            'I_FECHA_CORTE': resp[0]['1029']['value'],
            'I_FACTURADOR': resp[0]['1022']['value'],
            'I_PROVEEDOR': resp[0]['1021']['value'],
            'I_IDCORTE': resp[0]['1030']['value'],
            'IT_DATA': [{
                    'MATERIAL': resp[0]['1024']['value'][0],
                    'CANTIDAD': resp[0]['1028']['value'],
                    'LOTE_PROV': resp[0]['1026']['value'][0],
                    'PROVEEDOR': resp[0]['1021']['value'],
                    'ALMACEN': "",
                    'NO_HUERTA': resp[0]['1031']['value'],
                    'NOM_HUERTA': resp[0]['1032']['value'],
                    'AGRICULTOR': resp[0]['1014']['value'][0],
                    'TIPO_FRUTA': resp[0]['1034']['value'][0],
                }]
        };
        const client = new node_rfc_1.Client(sap_1.abapSystem);
        client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
            client.invoke("Z_RFC_VA_ENTRADAAGRANEL", IT_DATA, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
                err ? res.json(err) : null;
                String(result['E_ORDEN_COMPRA']).length > 0 ? postBanderaTCI(res, result, record) : res.json(result['IT_MESSAGE_WARNING']);
            }));
        }));
    });
});
function postBanderaTCI(res, result, record) {
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to": "bqdcp8ghy",
        "data": [{
                "1038": { "value": true },
                "3": { "value": record },
                "1060": { "value": result.E_ORDEN_COMPRA }
            }]
    };
    ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata')).subscribe(resp => res.json({ resp, result }), err => res.json(err.response));
}
exports.default = agranel;
