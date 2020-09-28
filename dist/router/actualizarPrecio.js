"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const act = express_1.Router();
act.get('/actualizarPrecio/:record', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records/query';
    const record = req.params.record;
    const args = {
        "from": "bqdcp8fbc",
        "select": [699, 688],
        "where": `{3.EX.${record}}`
    };
    const obs$ = ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data'));
    obs$.subscribe(resp => {
        const args = {
            I_FACTURADOR: resp[0]['688']['value'],
            I_ORDEN_COMPRA: resp[0]['699']['value'][0]
        };
        const client = new node_rfc_1.Client(sap_1.abapSystem);
        client.connect((resul, er) => {
            er ? res.json({ ok: false, message: er }) : null;
            client.invoke('Z_RFC_VA_ACTUALIZARFACT', args, (error, resultado) => {
                error ? res.json({ ok: false, message: error }) : null;
                resultado.E_OK == "X" ? validacionActualizarPreicon(record, resultado, res) : res.json(resultado);
            });
        });
    });
});
function validacionActualizarPreicon(record, result, res) {
    const argsActualizarPrecio = {
        "to": "bqdcp8fbc",
        "data": [{
                "703": {
                    "value": "true"
                },
                "3": {
                    "value": `${record}`
                }
            }]
    };
    const obs$ = ajax_1.ajax({
        createXHR: utils_1.createXHR,
        url: 'https://api.quickbase.com/v1/records',
        method: 'POST',
        headers: utils_1.headers,
        body: argsActualizarPrecio
    }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata'));
    obs$.subscribe(resu => res.json(result['E_MESSAGE']));
}
exports.default = act;
