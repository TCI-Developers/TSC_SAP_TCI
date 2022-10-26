"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const tonrecibidas = express_1.Router();
tonrecibidas.get('/tonrecibidas/:type', (req, res) => {
    const type = req.params.type;
    let table = '';
    let client = null;
    let tonrecibidas = [];
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_KPICostos_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_KPICostos_SAP_test)) : null;
    const body = {
        "from": table,
        "select": [18, 76, 8, 74, 73, 77, 78, 79],
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    //res.json({msg: body });
    ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response')).subscribe((resp) => {
        for (const item of resp.data) {
            tonrecibidas.push({
                Fecha: item['18'].value,
                Kilos_recibidos: item['76'].value,
                Huerta: item['8'].value,
                Lote: item['74'].value,
                Kilos_empaque: item['73'].value,
                Kilos_proveedor: item['77'].value,
                Ordenes_cuadrillas: item['78'].value,
                Ordenes_fletes: item['79'].value,
            });
        }
        res.json({ Tonrecibidas: tonrecibidas });
    });
});
exports.default = tonrecibidas;
