"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const path_1 = __importDefault(require("path"));
const pathViews = path_1.default.resolve(__dirname, '../views');
const act = (0, express_1.Router)();
act.get('/actualizarPrecio/:record/:type', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records/query';
    const record = req.params.record;
    const type = req.params.type;
    let client = null;
    let table = '';
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Acuerdos_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Acuerdos_test)) : null;
    const args = {
        "from": table,
        "select": [699, 688],
        "where": `{3.EX.${record}}`
    };
    const obs$ = (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'data'));
    obs$.subscribe(resp => {
        const args = {
            I_FACTURADOR: resp[0]['688']['value'],
            I_ORDEN_COMPRA: resp[0]['699']['value'][0]
        };
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
        "to": String(utils_1.Tables.T_Acuerdos_prod),
        "data": [{
                "703": {
                    "value": "true"
                },
                "3": {
                    "value": `${record}`
                }
            }]
    };
    const obs$ = (0, ajax_1.ajax)({
        createXHR: utils_1.createXHR,
        url: 'https://api.quickbase.com/v1/records',
        method: 'POST',
        headers: utils_1.headers,
        body: argsActualizarPrecio
    }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'metadata'));
    const statusUpdate = [{ tipo: 'Update', value: result['E_MESSAGE'] }];
    obs$.subscribe(resu => res.render(`${pathViews}/acuerdos.hbs`, { mensaje: statusUpdate })); // res.json(result['E_MESSAGE']));
}
exports.default = act;
