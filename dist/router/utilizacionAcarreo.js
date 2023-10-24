"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const utilizacionAcarreo = (0, express_1.Router)();
utilizacionAcarreo.get('/aucarreo/:type', (req, res) => {
    const type = req.params.type;
    let table = '';
    let client = null;
    let utilAcarreo = [];
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_DetalleA_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_DetalleA_SAP_test)) : null;
    const body = {
        "from": table,
        "select": [43, 1043, 93, 1072, 138, 19, 3, 138, 1103],
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    //res.json({msg: body });
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response')).subscribe((resp) => {
        for (const item of resp.data) {
            utilAcarreo.push({
                Fecha: item['43'].value,
                TipoTransporte: item['1043'].value,
                Kilogramos: item['93'].value,
                OrdenCompra: item['1072'].value,
                Capacidad: item['138'].value,
                Acuerdo: item['19'].value,
                DetalleAcuerdo: item['3'].value,
                NumeroCajas: item['138'].value,
                CostoCorte: item['1103'].value,
            });
        }
        res.json({ UtAcarreo: utilAcarreo });
    });
});
exports.default = utilizacionAcarreo;
