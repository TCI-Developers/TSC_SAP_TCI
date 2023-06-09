"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const huertas = (0, express_1.Router)();
huertas.get('/huertas/:type', (req, res) => {
    const type = req.params.type;
    let table = '';
    let client = null;
    let huertas = [];
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Huertas_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Huertas_SAP_test)) : null;
    const body = {
        "from": table,
        "select": [6, 115, 7, 9, 10]
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    //res.json({msg: body });
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(5), (0, operators_1.pluck)('response')).subscribe((resp) => {
        for (const item of resp.data) {
            huertas.push({
                Nombre: item['6'].value,
                Localidad: item['115'].value,
                Sagarpa: item['7'].value,
                Municipio: item['9'].value,
                Organico: item['10'].value,
            });
        }
        res.json({ huertas: huertas });
    });
});
exports.default = huertas;
