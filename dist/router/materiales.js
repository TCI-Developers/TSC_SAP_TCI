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
const materiales = express_1.Router();
materiales.get('/materiales', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    let data = [];
    let arregloM = [];
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        client.invoke('Z_RFC_TBL_CATALOG_MAT', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            //res.json(result);
            data = yield result["IT_MATERIALES"];
            data = data.filter(mat => (mat.MTART == "ZROH" || mat.MTART == "ZUNB" || mat.MTART == "ZHAL"));
            data.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                arregloM.push({
                    "6": { "value": value.MATNR },
                    "7": { "value": value.MTART },
                    "8": { "value": value.MATKL },
                    "9": { "value": value.MEINS },
                    "10": { "value": value.BRGEW },
                    "11": { "value": value.NTGEW },
                    "12": { "value": value.MAKTG }
                });
            }));
            const args = {
                "to": "bqrxem5py",
                "data": arregloM
            };
            const obs$ = ajax_1.ajax({
                createXHR: utils_1.createXHR,
                url: 'https://api.quickbase.com/v1/records',
                method: 'POST',
                headers: utils_1.headers,
                body: args
            }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata'));
            obs$.subscribe(respuesta => res.json({ creados_modificados: respuesta }), err => res.json(err));
        }));
    }));
}));
exports.default = materiales;
