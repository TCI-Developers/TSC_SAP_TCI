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
const router = express_1.Router();
router.get('/materiales', (req, res) => {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    let data = [];
    let arregloM = [];
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        client.invoke('Z_RFC_TBL_CATALOG_MAT', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            data = yield result["IT_MATERIALES"];
            data = data.filter(mat => (mat.MTART == "ZROH" || mat.MTART == "ZHAL"));
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
            obs$.subscribe(respuesta => res.json(respuesta), err => res.json(err));
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
    const args1 = {
        "from": "bqdcp8fbc",
        "select": [675, 676, 667, 677, 29, 669],
        "where": `{58.EX.${fecha}}`
    };
    const args2 = {
        "to": "bqdcp8wnc",
        "data": [{
                "117": {
                    "value": "true"
                },
                "6": {
                    "value": `${fecha}`
                }
            }]
    };
    const obs$ = ajax_1.ajax({
        createXHR: utils_1.createXHR,
        url: 'https://api.quickbase.com/v1/records/query',
        method: 'POST',
        headers: utils_1.headers,
        body: args1
    }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data'));
    obs$.subscribe((result) => {
        result.length < 1 ? res.json('No hay acuerdos que mandar') : null;
        result.forEach(value => {
            const args = {
                FECHA: String(value['675']['value']),
                USUARIO: String(value['676']['value']['email']),
                PROVEEDOR: String(value['667']['value'][0]),
                OPERACION: String(value['677']['value']),
                MATERIAL: "",
                GRUPO_MATERIAL: "001",
                PRECIO: String(value['29']['value'] + ".00").substring(0, 5),
                MONEDA: String(value['669']['value']),
                CORTE: "",
                ORDEN_COMPRA: ""
            };
            args.FECHA == "" ? res.json('No se mando Fecha') :
                args.USUARIO == "" ? res.json('No se mando Usuario') :
                    args.PROVEEDOR == "" ? res.json('No se mando Proveedor') :
                        args.OPERACION == "" ? res.json('No se mando Operacion') :
                            args.PRECIO == "" ? res.json('No se mando Precio') :
                                args.MONEDA == "" ? res.json('No se mando Moneda') : null;
            const client = new node_rfc_1.Client(sap_1.abapSystem);
            client.connect((resul, er) => {
                er ? res.json({ ok: false, message: er }) : null;
                client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (err, resultado) => {
                    err ? res.json({ ok: false, message: err }) : null;
                    const obs$ = ajax_1.ajax({
                        createXHR: utils_1.createXHR,
                        url: 'https://api.quickbase.com/v1/records',
                        method: 'POST',
                        headers: utils_1.headers,
                        body: args2
                    }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata'));
                    String(resultado['MENSAJE']).substring(1, 3) == "100" ? obs$.subscribe(respuesta => res.json({ respuesta, resultado }), err => res.json(err)) : res.json('Algo salio mal.');
                });
            });
        });
    }, errors => {
        res.json(errors);
    });
});
exports.default = router;
