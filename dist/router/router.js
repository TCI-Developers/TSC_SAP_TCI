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
const router = express_1.Router();
router.get('/materiales', (req, res) => {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    const body = req.body;
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_MAT', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let data = yield result["IT_PROVEEDORES"];
            res.json({
                result
            });
        }));
    }));
});
router.get('/proveedores', (req, res) => {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    const body = req.body;
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let data = yield result["IT_PROVEEDORES"];
            res.json({
                result
            });
        }));
    }));
});
router.post('/precio', (req, res) => {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    const body = req.body;
    const args = {
        FECHA: "07.08.2020",
        USUARIO: "Manuel",
        PROVEEDOR: "100021",
        OPERACION: "1",
        MATERIAL: "",
        GRUPO_MATERIAL: "001",
        PRECIO: "31.30",
        MONEDA: "MXN",
        CORTE: "6333",
        ORDEN_COMPRA: "85643"
    };
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let data = yield result["IT_PROVEEDORES"];
            res.json({
                result
            });
        }));
    }));
});
exports.default = router;
