"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'ZREC_CAB', DELIMITER:"," , FIELDS: ["IDVIAJE", "COMPRADOR", "NOMPROV"], ROWCOUNT: 5 }, (err:any, result:any) => {        
const router = express_1.Router();
router.get('/conexion', (req, res) => {
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    const args = {
        "ALMACEN": "1104",
        "AUFNR": "A01",
        "MATERIAL": "567",
        "MENGE": "5",
    };
    client.connect((result, err) => {
        err ? res.json({ ok: false, message: err }) : null;
        client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [args] }, (err, result) => {
            err ? res.json({ ok: false, message: err }) : null;
            res.json({
                result
            });
        });
    });
});
exports.default = router;
