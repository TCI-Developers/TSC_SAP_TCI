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
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const utils_1 = require("../utils/utils");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const path_1 = __importDefault(require("path"));
//client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
const pathViews = path_1.default.resolve(__dirname, '../views');
const facturador = (0, express_1.Router)();
facturador.get('/facturadores/:type', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records';
    const type = req.params.type;
    let table = '';
    let client = null;
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Benefeciarios_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Benefeciarios_test)) : null;
    let arregloM = [];
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        client.invoke('Z_RFC_TBL_CATALOG_PRO', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let facturadores = yield result["IT_FACTURADORES"];
            facturadores.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                arregloM.push({
                    "6": { "value": value.LIFN2 },
                    "40": { "value": value.LAND1 },
                    "7": { "value": value.NAME1 },
                    "43": { "value": value.NAME2 },
                    "45": { "value": value.ORT01 },
                    "42": { "value": value.EKORG },
                    "39": { "value": value.LIFNR },
                    "41": { "value": value.PARVW },
                    "44": { "value": value.DEFPA },
                });
            }));
            const argsFacturadores = {
                "to": table,
                "data": arregloM
            };
            const obs$ = (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsFacturadores }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'metadata', 'unchangedRecordIds'));
            obs$.subscribe(resp => res.render(`${pathViews}/proveedores.hbs`, { tipo: 'Facturadores', creados_modificados: resp }), err => res.json(err.response));
            // obs$.subscribe(resp => res.json({ creados_modificados: resp }), err => res.json(err.response) );
        }));
    }));
});
exports.default = facturador;
