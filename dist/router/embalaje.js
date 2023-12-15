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
const embalaje = (0, express_1.Router)();
embalaje.get('/embalaje/:type', (req, res) => {
    let data = [];
    let arregloM = [];
    const type = req.params.type;
    let table = '';
    let client = null;
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Productos_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Productos_test)) : null;
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        ;
        client.invoke('Z_RFC_NORMA_EMBALAJE', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            data = yield result["IT_PACKPS"];
            data.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                arregloM.push({
                    "6": { "value": value.CONTENT },
                    "7": { "value": value.POBJID },
                    "43": { "value": value.PACKNR }
                });
            }));
            const args = {
                "to": table,
                "data": arregloM
            };
            (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url: 'https://api.quickbase.com/v1/records', method: 'POST', headers: utils_1.headers, body: args }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'metadata')).subscribe(respuesta => res.json({ creados_modificados: respuesta }), err => res.json(err));
        }));
    }));
});
exports.default = embalaje;
