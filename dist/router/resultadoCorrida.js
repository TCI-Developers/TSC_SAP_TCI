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
const resultadoCorrida = express_1.Router();
resultadoCorrida.get('/resultadoCorrida/:ordenCompraAgranel', (req, res) => {
    const ordenCompra = req.params.ordenCompraAgranel;
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        const args = {
            I_ORDENCOMPRA: ordenCompra
        };
        client.invoke('Z_RFC_RESULTOC_RDM', args, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            postResultado(res, result);
        }));
    }));
});
function postResultado(res, result) {
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to": "brhh5xmxa",
        "data": [{
                "6": { "value": result.EBELN },
                "7": { "value": result.EBELP },
                "11": { "value": result.MATNR },
                "8": { "value": result.MENGE },
                "9": { "value": result.MEINS },
                "12": { "value": result.CHARG },
                "10": { "value": result.BUDAT }
            }]
    };
    ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe(operators_1.timeout(60000), operators_1.retry(5)).subscribe(resp => res.json({ SAP: result, TCI: resp.response.metadata }));
}
exports.default = resultadoCorrida;
