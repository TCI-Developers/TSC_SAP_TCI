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
const cliente = express_1.Router();
cliente.get('/cliente/:embarque/:type', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records';
    const embarque = req.params.embarque;
    const type = req.params.type;
    let client = null;
    let table = '';
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Embarques_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Embarques_test)) : null;
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        const args = {
            I_VBELN: embarque
        };
        client.invoke('Z_RFC_DESTINOEMBARQUE', args, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let embarques = result["IT_DELIVERY"];
            let arregloM = [];
            embarques.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                arregloM.push({
                    "119": { "value": value.NAME1 },
                    "120": { "value": value.CITY1 },
                    "121": { "value": value.CP },
                    "122": { "value": value.CALLE },
                    "123": { "value": value.NUM },
                    "74": { "value": embarque },
                });
            }));
            const argsVentas = {
                "to": table,
                "data": arregloM
            };
            ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsVentas }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata')).subscribe(resp => res.json({ registros_creados: resp }), err => res.json(err.response));
        }));
    }));
});
exports.default = cliente;
