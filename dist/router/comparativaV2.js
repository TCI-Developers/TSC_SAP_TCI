"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const comparativasV2 = (0, express_1.Router)();
comparativasV2.get('/comparativas/v2/:type', (req, res) => {
    const type = req.params.type;
    let table = '';
    let client = null;
    var json;
    let argsResults = [];
    let resultCorrida = [];
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Lotes_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Lotes_SAP_prod)) : null;
    const body = {
        "from": table,
        "select": [55, 14, 68, 6, 18, 12, 57, 20, 118, 70, 120, 71, 72, 73, 74, 75, 76, 77, 117, 113, 114, 115, 145, 146, 147, 148, 149, 150, 151]
    };
    const url = 'https://api.quickbase.com/v1/records/query';
    (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.first)(), (0, operators_1.timeout)(20000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response')).subscribe((resp) => {
        for (const item of resp.data) {
            let headerData = {
                Acuerdo: item['55'].value,
                Fecha_Corte: item['14'].value,
                Detalles_Acuerdo: item['68'].value,
                Lote: item['6'].value,
                Orden_agranel: item['18'].value,
                Sagarpa: item['12'].value,
                Huerta: item['57'].value,
                Kilos_agranel: item['20'].value,
                Kilos_estimados: item['118'].value,
                Tipo_corte: item['70'].value,
                MateriaSeca: item['120'].value
            };
            resultCorrida.push(Corridas(headerData, String(item['71'].value), 'Categoria 1'));
            resultCorrida.push(Corridas(headerData, String(item['72'].value), 'Categoria 1'));
            resultCorrida.push(Corridas(headerData, String(item['73'].value), 'Categoria 1'));
            resultCorrida.push(Corridas(headerData, String(item['74'].value), 'Categoria 1'));
            resultCorrida.push(Corridas(headerData, String(item['75'].value), 'Categoria 1'));
            resultCorrida.push(Corridas(headerData, String(item['76'].value), 'Categoria 1'));
            resultCorrida.push(Corridas(headerData, String(item['77'].value), 'Categoria 1'));
            resultCorrida.push(Corridas(headerData, String(item['145'].value), 'Categoria 2'));
            resultCorrida.push(Corridas(headerData, String(item['146'].value), 'Categoria 2'));
            resultCorrida.push(Corridas(headerData, String(item['147'].value), 'Categoria 2'));
            resultCorrida.push(Corridas(headerData, String(item['148'].value), 'Categoria 2'));
            resultCorrida.push(Corridas(headerData, String(item['149'].value), 'Categoria 2'));
            resultCorrida.push(Corridas(headerData, String(item['150'].value), 'Categoria 2'));
            resultCorrida.push(Corridas(headerData, String(item['151'].value), 'Categoria 2'));
            resultCorrida.push(Corridas(headerData, String(item['117'].value), 'Canica'));
            resultCorrida.push(Corridas(headerData, String(item['113'].value), 'T Categoria 1'));
            resultCorrida.push(Corridas(headerData, String(item['114'].value), 'T Categoria 2'));
            resultCorrida.push(Corridas(headerData, String(item['115'].value), 'Nacional'));
        }
        res.json({ corridas: resultCorrida });
    });
});
function Corridas(headData, details, categoria) {
    let [calibre, visita, corrida, erV, calidad, erCalidad, supervisor, erS, cuadrilla, erC, material, desc, kg] = details.split('|');
    let objtFinal = {
        Acuerdo: headData.Acuerdo,
        Fecha_Corte: headData.Fecha_Corte,
        Detalles_Acuerdo: headData.Detalles_Acuerdo,
        Lote: headData.Lote,
        Orden_agranel: headData.Orden_agranel,
        Sagarpa: headData.Sagarpa,
        Huerta: headData.Huerta,
        Kilos_agranel: headData.Kilos_agranel,
        Kilos_estimados: headData.Kilos_estimados,
        Tipo_corte: headData.Tipo_corte,
        MateriaSeca: headData.MateriaSeca,
        Calibre: calibre,
        Visita: visita,
        Corrida: corrida,
        ErrorVisita: erV,
        Calidad: calidad,
        ErrorCalidad: erCalidad,
        Supervisor: supervisor,
        ErrorS: erS,
        Cuadrilla: cuadrilla,
        ErrorC: erC,
        Material: material,
        Descripcion: desc,
        Categoria: categoria.toString(),
        Kilogramos: Number(kg),
    };
    return objtFinal;
}
exports.default = comparativasV2;
