"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const comparativas = (0, express_1.Router)();
comparativas.get('/comparativas/:type', (req, res) => {
    const type = req.params.type;
    let table = '';
    let client = null;
    // let calibreCorrida :Categoria1[] = [];
    let categoria1 = [];
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_KPICostos_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_KPICostos_SAP_test)) : null;
    const body = {
        "from": table,
        "select": [15, 18, 51, 74, 35, 6, 8, 32, 117, 118, 119, 120, 121, 122, 123, , 175, 176, 177, 178, 179, 180, 181, 124, 125, 139, 182, 185, 186]
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    //res.json({msg: body });
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response')).subscribe((resp) => {
        for (const item of resp.data) {
            categoria1.push({
                Acuerdo: item['15'].value,
                Fecha_Corte: item['18'].value,
                Detalles_Acuerdo: item['51'].value,
                Lote: item['74'].value,
                Orden_agranel: item['35'].value,
                Sagarpa: item['6'].value,
                Huerta: item['8'].value,
                Kilos_agranel: item['32'].value,
                Kilos_estimados: item['186'].value,
                Tipo_corte: item['185'].value,
                Calibre32: Calibres(String(item['117'].value)),
                Calibre36: Calibres(String(item['118'].value)),
                Calibre40: Calibres(String(item['119'].value)),
                Calibre48: Calibres(String(item['120'].value)),
                Calibre60: Calibres(String(item['121'].value)),
                Calibre70: Calibres(String(item['122'].value)),
                Calibre84: Calibres(String(item['123'].value)),
                Categoria1: Categ(String(item['124'].value)),
                Categoria2: Categ(String(item['125'].value)),
                Nacional: Categ(String(item['139'].value)),
                Canica: Categ(String(item['182'].value)),
            });
        }
        res.json({ corridas: categoria1 });
    });
});
function Calibres(calibreCorrida) {
    let [visita, corrida, er, material, desc] = calibreCorrida.split('-');
    const result = {
        Visita: Number(visita),
        Corrida: Number(corrida),
        Error: Number(er),
        Material: material,
        Descripcion: desc
    };
    return result;
}
function Categ(calibreCorrida) {
    let [visita, corrida, er] = calibreCorrida.split('-');
    const cat = {
        Visita: Number(visita),
        Corrida: Number(corrida),
        Error: Number(er),
    };
    return cat;
}
exports.default = comparativas;
