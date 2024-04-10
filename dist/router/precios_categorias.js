"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const precios = (0, express_1.Router)();
precios.get('/precios/:type', (req, res) => {
    const type = req.params.type;
    let table = '';
    let client = null;
    let status = 'Activo';
    let resultCorrida = [];
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Precios_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Precios_SAP_test)) : null;
    const body = {
        "from": table,
        "select": [25, 26, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
        "where": `{44.EX.${status}}`
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.first)(), (0, operators_1.timeout)(20000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response')).subscribe((resp) => {
        for (const item of resp.data) {
            let headerData = {
                status: item['44'].value,
                fecha_inicio: item['25'].value,
                fecha_final: item['26'].value,
            };
            resultCorrida.push(preciosCat(headerData, String(item['31'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['32'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['33'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['34'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['35'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['36'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['37'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['38'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['39'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['40'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['41'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['42'].value)));
            resultCorrida.push(preciosCat(headerData, String(item['43'].value)));
        }
        res.json({ corridas: resultCorrida });
    });
});
function preciosCat(headData, details) {
    let [tipo, cat1, cat2] = details.split('|');
    let objtFinal = {
        status: headData.status,
        fecha_inicio: headData.fecha_inicio,
        fecha_final: headData.fecha_final,
        calibre: tipo,
        cat_1: parseFloat(cat1),
        cat_2: parseFloat(cat2),
    };
    return objtFinal;
}
exports.default = precios;
