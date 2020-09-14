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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const proveedor = express_1.Router();
proveedor.get('/proveedores', (req, res) => {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    let arregloM = [];
    const url = 'https://api.quickbase.com/v1/records';
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let proveedores = yield result["IT_PROVEEDORES"];
            proveedores.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                arregloM.push({
                    "71": { "value": value.LIFNR },
                    "73": { "value": value.LAND1 },
                    "6": { "value": value.NAME1 },
                    "72": { "value": value.NAME2 },
                    "26": { "value": value.ORT01 },
                    "74": { "value": value.EKORG },
                    "75": { "value": value.ZTERM },
                    "76": { "value": value.KALSK },
                });
            }));
            const argsFacturadores = {
                "to": "bqdcp8k48",
                "data": arregloM
            };
            const obs$ = ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsFacturadores }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata', 'unchangedRecordIds'));
            obs$.subscribe(resp => res.json({ creados_modificados: resp }), err => res.json(err.response));
        }));
    }));
});
exports.default = proveedor;
