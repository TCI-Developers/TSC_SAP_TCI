"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const path_1 = __importDefault(require("path"));
const pathViews = path_1.default.resolve(__dirname, '../views');
const flotilla = (0, express_1.Router)();
flotilla.get('/flotilla/:record/:proveedores/:type', (req, res) => {
    const record = req.params.record;
    const proveedores = req.params.proveedores.split("-");
    const type = req.params.type;
    let table = '';
    const status = 'Autorizada';
    let client = null;
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Detalle_Corte_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Detalle_Corte_test)) : null;
    for (const item of proveedores) {
        const body = {
            "from": table,
            "select": [651, 658, 14, 654, 644, 3, 699, 700],
            "where": `{14.EX.${record}}AND{651.EX.${item}}AND{676.EX.''}AND{182.EX.''}AND{703.EX.${status}}`
        };
        const url = 'https://api.quickbase.com/v1/records/query';
        (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'data')).subscribe((resp) => {
            //res.json(resp);
            let IT_DATA = null;
            let importe = null;
            let ids = [];
            for (const item of resp) {
                ids.push(item['3']['value']);
                IT_DATA = {
                    'I_PROVEEDOR': item['651']['value'],
                    'I_FECHA_CORTE': item['658']['value'],
                    'I_TEST': "",
                    'I_IDCORTE': String(item['14']['value']),
                    'I_CENTRO': item['699']['value'],
                    'I_EKORG': item['700']['value'],
                    'IT_DATA': [{
                            'SERVICIO': item['654']['value'],
                            'CANTIDAD': "1.00",
                            'PROVEEDOR': item['651']['value'],
                            'UMEDIDA': "SER",
                            'IMPORTE': importe += item['644']['value'],
                            'GPO_ARTICULO': "",
                            'CENTRO': "1100",
                        }]
                };
            }
            //   res.json(IT_DATA);
            client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
                client.invoke("Z_RFC_VA_ENTRADAFLOTILLA", IT_DATA, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
                    err ? res.json(err) : null;
                    String(result['E_ORDEN_COMPRA']).length > 0 ? (postBanderaTCI(res, result, ids, table)) : res.render(`${pathViews}/flotillas.hbs`, { tipo: 'WARNING', respuesta: result['IT_MESSAGE_WARNING'] }); //res.json(result['IT_MESSAGE_WARNING']);
                }));
            }));
        });
    }
});
function postBanderaTCI(res, result, ids, table) {
    const url = 'https://api.quickbase.com/v1/records';
    for (const iterator of ids) {
        const args = {
            "to": table,
            "data": [{
                    "3": { "value": iterator },
                    "676": { "value": result.E_ORDEN_COMPRA }
                }]
        };
        (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe(
        //ajax({ url, method: 'POST', body: args }).pipe(
        (0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'metadata')).subscribe(resp => res.render(`${pathViews}/flotillas.hbs`, { tipo: 'EXITO', respuesta: result['IT_MENSAJE_EXITOSOS'] }), err => res.json(err.response));
        //['IT_MENSAJE_EXITOSOS']
        //res.render(`${pathViews}/proveedores.hbs` ,{ tipo:'Ventas', creados_modificados: resp })
        // res.json(result['IT_MENSAJE_EXITOSOS'])
    }
}
exports.default = flotilla;
