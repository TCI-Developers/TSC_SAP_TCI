"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const kpicostos = (0, express_1.Router)();
kpicostos.get('/kpicostos/:type', (req, res) => {
    const type = req.params.type;
    let table = '';
    let client = null;
    let kpiCostosCortes = [];
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_KPICostos_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_KPICostos_SAP_test)) : null;
    const body = {
        "from": table,
        "select": [6, 8, 15, 51, 52, 24, 18, 76, 71, 78, 79],
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    //res.json({msg: body });
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response')).subscribe((resp) => {
        for (const item of resp.data) {
            kpiCostosCortes.push({
                Sagarpa: item['6'].value,
                Huerta: item['8'].value,
                Acuerdo: item['15'].value,
                Detalle_corte: item['51'].value,
                Proveedor: item['52'].value,
                Productor: item['24'].value,
                Fecha: item['18'].value,
                Kilos_recibidos: item['76'].value,
                Monto: item['71'].value,
                Ordenes_cuadrillas: item['78'].value,
                Ordenes_fletes: item['79'].value,
            });
        }
        // res.json({resp});
        res.json({ KPICostosCortes: kpiCostosCortes });
    });
    // obs$.subscribe(resp =>  res.json( {  KPICostosCortes: resp }), err => res.json(err.response) );
});
exports.default = kpicostos;
