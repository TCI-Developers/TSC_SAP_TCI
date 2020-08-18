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
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'ZREC_CAB', DELIMITER:"," , FIELDS: ["IDVIAJE", "COMPRADOR", "NOMPROV"], ROWCOUNT: 5 }, (err:any, result:any) => {        
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'Z_RFC_TBL_CATALOG_PRO', DELIMITER:"," ROWCOUNT: 5 }, (err:any, result:any) => {
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const utils_1 = require("../utils/utils");
const router = express_1.Router();
router.get('/materiales', (req, res) => {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_MAT', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let data = yield result["IT_MATERIALES"];
            res.json(data);
        }));
    }));
});
router.get('/proveedores', (req, res) => {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let data = yield result["IT_FACTURADORES"];
            res.json(data);
        }));
    }));
});
router.get('/acuerdo/:fecha', (req, res) => {
    const fecha = req.params.fecha;
    const argsQ = {
        "from": "bqdcp8fbc",
        "select": [675, 676, 667, 677, 29, 669],
        "where": `{58.EX.${fecha}}`
    };
    const obs$ = ajax_1.ajax({
        createXHR: utils_1.createXHR,
        url: 'https://api.quickbase.com/v1/records/query',
        method: 'POST',
        headers: utils_1.headers,
        body: argsQ
    }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data'), operators_1.map((resp) => resp), operators_1.catchError(error => {
        res.json(error);
        return rxjs_1.of(error);
    }));
    obs$.subscribe(result => {
        try {
            const args = {
                FECHA: result[0]['675']['value'],
                USUARIO: result[0]['676']['value']['email'],
                PROVEEDOR: result[0]['667']['value'][0],
                OPERACION: result[0]['677']['value'],
                MATERIAL: "",
                GRUPO_MATERIAL: "001",
                PRECIO: String(result[0]['29']['value'] + ".00").substring(0, 5),
                MONEDA: result[0]['669']['value'],
                CORTE: "",
                ORDEN_COMPRA: ""
            };
            const client = new node_rfc_1.Client(sap_1.abapSystem);
            client.connect((resul, er) => {
                er ? res.json({ ok: false, message: er }) : null;
                client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (err, resultado) => {
                    if (err) {
                        return res.json({ ok: false, message: err });
                    }
                    res.json({
                        message: "Respuesta de SAP",
                        resultado
                    });
                });
            });
        }
        catch (error) {
            res.json(error);
        }
    }, errors => {
        res.json(errors);
    });
});
exports.default = router;
