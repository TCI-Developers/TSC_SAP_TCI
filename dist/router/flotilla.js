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
    let data = [];
    for (const item of proveedores) {
        const body = {
            "from": "bqdcp8je5",
            "select": [651, 658, 14, 654, 644],
            "where": `{14.EX.${record}}AND{651.EX.${item}}`
        };
        const url = 'https://api.quickbase.com/v1/records/query';
        ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data')).subscribe((resp) => {
            data = [];
            let IT_DATA = null;
            let importe = null;
            for (const item of resp) {
                IT_DATA = {
                    'I_PROVEEDOR': item['651']['value'],
                    'I_FECHA_CORTE': item['658']['value'],
                    'I_TEST': "",
                    'I_IDCORTE': item['14']['value'],
                    'IT_DATA': [{
                            'SERVICIO': item['654']['value'],
                            'CANTIDAD': "1",
                            'PROVEEDOR': item['651']['value'],
                            'UMEDIDA': "SER",
                            'IMPORTE': importe += item['644']['value'],
                            'GPO_ARTICULO': "",
                            'CENTRO': "1100"
                        }]
                };
            }
            //res.json(IT_DATA);
            const client = new node_rfc_1.Client(sap_1.abapSystem);
            client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
                client.invoke("Z_RFC_VA_ENTRADAFLETE", IT_DATA, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
                    err ? res.json(err) : null;
                    res.json(result);
                    //String(result['E_ORDEN_COMPRA']).length > 0 ? postBanderaTCI(res, result, record) : res.json(result['IT_MESSAGE_WARNING']);
                }));
            }));
        });
    }
});
function postBanderaTCI(res, result, record) {
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to": "bqdcp8ghy",
        "data": [{
                "1062": { "value": true },
                "3": { "value": record },
            }]
    };
    ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata')).subscribe(resp => res.json({ resp, result }), err => res.json(err.response));
}
exports.default = flotilla;
