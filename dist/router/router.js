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
let arregloAll = [];
const router = express_1.Router();
router.get('/acuerdo/:fecha', (req, res) => {
    const fecha = req.params.fecha;
    const args1 = {
        "from": "bqdcp8fbc",
        "select": [675, 676, 658, 677, 29, 669, 678],
        "where": `{58.EX.${fecha}}AND{489.EX.true}AND{680.EX.false}`
    };
    const args2 = {
        "to": "bqdcp8fbc",
        "data": [{
                "680": {
                    "value": "true"
                },
                "681": {
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
            value['677']['value'] === '1' ? postAcuerdo(value, args2, res) : postBandeado(value, args2, res);
        });
    }, errors => {
        res.json(errors);
    });
});
router.get('/acuerdo1/:record', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records/query';
    const record = req.params.record;
    const argsAcuerdos = {
        "from": "bqdcp8fbc",
        "select": [675, 676, 658, 677, 29, 669, 678],
        "where": `{3.EX.${record}}AND{489.EX.true}AND{680.EX.false}`
    };
    const argsValidacion = {
        "to": "bqdcp8fbc",
        "data": [{
                "680": {
                    "value": "true"
                },
                "3": {
                    "value": `${record}`
                }
            }]
    };
    const obs$ = ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsAcuerdos }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data'));
    obs$.subscribe((result) => {
        result.length < 1 ? res.json('No hay acuerdos que mandar') : null;
        result.forEach(value => {
            value['677']['value'] === '1' ? postAcuerdo(value, argsValidacion, res) : postBandeado(value, res);
        });
    }, errors => {
        res.json(errors);
    });
});
function postBandeado(value, res) {
    let arregloP = value['678']['value'];
    const url = 'https://api.quickbase.com/v1/records';
    arregloP.forEach((val) => {
        let codigoPrecio = val.split("-");
        const argsValidacion = {
            "to": "bqr9nfpuk",
            "data": [{
                    "16": {
                        "value": "true"
                    },
                    "3": {
                        "value": `${codigoPrecio[2]}`
                    }
                }]
        };
        const args = {
            FECHA: String(value['675']['value']),
            USUARIO: String(value['676']['value']['email']),
            PROVEEDOR: String(value['658']['value']),
            OPERACION: String(value['677']['value']),
            MATERIAL: codigoPrecio[0],
            GRUPO_MATERIAL: "",
            PRECIO: String(codigoPrecio[1] + ".00").substring(0, 5),
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
            client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (error, resultado) => __awaiter(this, void 0, void 0, function* () {
                error ? res.json({ ok: false, message: error }) : null;
                const obs$ = ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsValidacion }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata'));
                String(resultado['MENSAJE']).substring(0, 3) === '200' ? obs$.subscribe(respuesta => res.json({ respuesta, resultado }), err => res.json(err)) :
                    String(resultado['MENSAJE']).substring(0, 3) === '201' ? obs$.subscribe(respuesta => res.json({ respuesta, resultado }), err => res.json(err)) :
                        String(resultado['MENSAJE']).substring(0, 3) === '202' ? obs$.subscribe(respuesta => res.json({ respuesta, resultado }), err => res.json(err)) : res.json(resultado);
            }));
        });
    });
}
function postAcuerdo(value, args2, res) {
    const args = {
        FECHA: String(value['675']['value']),
        USUARIO: String(value['676']['value']['email']),
        PROVEEDOR: String(value['658']['value']),
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
        client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (error, resultado) => {
            error ? res.json({ ok: false, message: error }) : null;
            const obs$ = ajax_1.ajax({
                createXHR: utils_1.createXHR,
                url: 'https://api.quickbase.com/v1/records',
                method: 'POST',
                headers: utils_1.headers,
                body: args2
            }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata'));
            String(resultado['MENSAJE']).substring(0, 3) === '100' ? obs$.subscribe(resp => res.json({ resp, resultado }), err => res.json(err)) :
                String(resultado['MENSAJE']).substring(0, 3) === '101' ? obs$.subscribe(resp => res.json({ resp, resultado }), err => res.json(err)) : res.json(resultado);
        });
    });
}
exports.default = router;
