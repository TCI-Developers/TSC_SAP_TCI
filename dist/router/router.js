"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'ZREC_CAB', DELIMITER:"," , FIELDS: ["IDVIAJE", "COMPRADOR", "NOMPROV"], ROWCOUNT: 5 }, (err:any, result:any) => {        
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'Z_RFC_TBL_CATALOG_PRO', DELIMITER:"," ROWCOUNT: 5 }, (err:any, result:any) => {
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const utils_1 = require("../utils/utils");
const router = express_1.Router();
router.get('/materiales', (req, res) => {
    //const client = new Client(abapSystem);
    const body = req.body;
    // client.connect( async (result:any, err:any) => {
    //     await err ? res.json({ ok:false, message: err}) : null;
    //     //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
    //     client.invoke('Z_RFC_TBL_CATALOG_MAT', { }, async (err:any, result:any) => {        
    //         await err ? res.json({ ok: false, message: err }) : null;
    //         let data:Proveedores[] = await result["IT_PROVEEDORES"];
    //         res.json({ 
    //             result
    //         });
    //     });
    // });
});
router.get('/proveedores', (req, res) => {
    //const client = new Client(abapSystem);
    const body = req.body;
    // client.connect( async (result:any, err:any) => {
    //     await err ? res.json({ ok:false, message: err}) : null;
    //     //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
    //     client.invoke('Z_RFC_TBL_CATALOG_PRO', { }, async (err:any, result:any) => {        
    //         await err ? res.json({ ok: false, message: err }) : null;
    //         let data:Proveedores[] = await result["IT_PROVEEDORES"];
    //         res.json({ 
    //             result
    //         });
    //     });
    // });   
});
router.post('/acuerdo', (req, res) => {
    //const client = new Client(abapSystem);
    const body = req.body;
    const args = {
        FECHA: "07.08.2020",
        USUARIO: "ing5@tciconsultoria.com",
        PROVEEDOR: "100021",
        OPERACION: "1",
        MATERIAL: "",
        GRUPO_MATERIAL: "001",
        PRECIO: "31.30",
        MONEDA: "MXN",
        CORTE: "6333",
        ORDEN_COMPRA: "85643"
    };
    res.json({ message: "Data recibida", body });
    // client.connect( async (result:any, err:any) => {
    //     await err ? res.json({ ok:false, message: err}) : null;
    //     client.invoke('Z_RFC_VA_PRECIOACUERDO', body, async (err:any, result:any) => {        
    //         await err ? res.json({ ok: false, message: err }) : null;
    //         res.json({
    //             message: "Respuesta de SAP",
    //             result
    //         });
    //     });
    // });   
});
router.get('/prueba/:fecha', (req, res) => {
    const fecha = req.params.fecha;
    let postVilla = null;
    const args = {
        "from": "bqdcp8fbc",
        "select": [675, 676, 667, 677, 29, 669],
        "where": `{58.EX.${fecha}}`
    };
    const obs$ = ajax_1.ajax({
        createXHR: utils_1.createXHR,
        url: 'https://api.quickbase.com/v1/records/query',
        method: 'POST',
        headers: utils_1.headers,
        body: args
    }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data'), operators_1.map((resp) => resp), operators_1.catchError(error => {
        res.json(error);
        return rxjs_1.of(error);
    }));
    obs$.subscribe(result => {
        postVilla = result;
        const argsVilla = {
            FECHA: postVilla[0]['675']['value'],
            USUARIO: postVilla[0]['676']['value']['email'],
            PROVEEDOR: postVilla[0]['667']['value'][0],
            OPERACION: postVilla[0]['677']['value'],
            GRUPO_MATERIAL: "001",
            PRECIO: postVilla[0]['29']['value'],
            MONEDA: postVilla[0]['669']['value'],
        };
        res.json(argsVilla);
    });
    // client.connect( async (result:any, err:any) => {
    //     await err ? res.json({ ok:false, message: err}) : null;
    //     client.invoke('Z_RFC_VA_PRECIOACUERDO', body, async (err:any, result:any) => {        
    //         await err ? res.json({ ok: false, message: err }) : null;
    //         res.json({
    //             message: "Respuesta de SAP",
    //             result
    //         });
    //     });
    // }); 
});
exports.default = router;
