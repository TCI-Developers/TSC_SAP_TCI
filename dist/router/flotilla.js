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
const flotilla = express_1.Router();
flotilla.get('/flotilla/:record/:proveedores', (req, res) => {
    const record = req.params.record;
    const proveedores = req.params.proveedores.split("-");
    for (const item of proveedores) {
        const body = {
            "from": "bqdcp8je5",
            "select": [651, 658, 14, 654, 644, 3, 699, 700],
            "where": `{14.EX.${record}}AND{651.EX.${item}}AND{676.EX.''}AND{182.EX.''}`
        };
        const url = 'https://api.quickbase.com/v1/records/query';
        ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data')).subscribe((resp) => {
            let IT_DATA = null;
            let importe = null;
            let ids = [];
            for (const item of resp) {
                ids.push(item['3']['value']);
                IT_DATA = {
                    'I_PROVEEDOR': item['651']['value'],
                    'I_FECHA_CORTE': item['658']['value'],
                    'I_TEST': "",
                    'I_IDCORTE': String(item['14']['value']),
                    'I_CENTRO': item['699']['value'],
                    'I_EKORG': item['700']['value'],
                    'IT_DATA': [{
                            'SERVICIO': item['654']['value'],
                            'CANTIDAD': "1.00",
                            'PROVEEDOR': item['651']['value'],
                            'UMEDIDA': "SER",
                            'IMPORTE': importe += item['644']['value'],
                            'GPO_ARTICULO': "",
                            'CENTRO': "1100"
                        }]
                };
            }
            const client = new node_rfc_1.Client(sap_1.abapSystem);
            client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
                client.invoke("Z_RFC_VA_ENTRADAFLETE", IT_DATA, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
                    err ? res.json(err) : null;
                    String(result['E_ORDEN_COMPRA']).length > 0 ? (postBanderaTCI(res, result, ids)) : res.json(result['IT_MESSAGE_WARNING']);
                }));
            }));
        });
    }
});
function postBanderaTCI(res, result, ids) {
    const url = 'https://api.quickbase.com/v1/records';
    for (const iterator of ids) {
        const args = {
            "to": "bqdcp8je5",
            "data": [{
                    "3": { "value": iterator },
                    "676": { "value": result.E_ORDEN_COMPRA }
                }]
        };
        ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe(
        //ajax({ url, method: 'POST', body: args }).pipe(
        operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata')).subscribe(resp => res.json(result['IT_MENSAJE_EXITOSOS']), err => res.json(err.response));
    }
}
exports.default = flotilla;
