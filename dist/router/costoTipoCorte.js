"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const costoCorte = (0, express_1.Router)();
costoCorte.get('/costocorte/:type', (req, res) => {
    const type = req.params.type;
    let table = '';
    let client = null;
    let costosC = [];
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_DetalleA_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_DetalleA_SAP_test)) : null;
    const body = {
        "from": table,
        "select": [1009, 30, 1072, 1051, 1105, 1106, 29, 19, 1108, 1109, 21]
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    //res.json({msg: body });
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response')).subscribe((resp) => {
        for (const item of resp.data) {
            costosC.push({
                Fecha: item['1009'].value,
                CostoFruta: item['30'].value,
                OrdenCompra: item['1072'].value,
                CostoAcarreo: item['1051'].value,
                OrdenCorteCuadrilla: item['1105'].value,
                CostoCuadrilla: item['1106'].value,
                TipoCorte: item['29'].value,
                Acuerdo: item['19'].value,
                Lote: item['1108'].value,
                Municipio: item['1109'].value,
                Comprador: item['21'].value,
            });
        }
        res.json({ costoxCorte: costosC });
    });
});
exports.default = costoCorte;
