import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'ZREC_CAB', DELIMITER:"," , FIELDS: ["IDVIAJE", "COMPRADOR", "NOMPROV"], ROWCOUNT: 5 }, (err:any, result:any) => {        

const router = Router();

router.get('/conexion', (req:Request, res:Response) => {

    const client = new Client(abapSystem);
    const args = {
        "ALMACEN": "1104",
        "AUFNR": "A01",
        "MATERIAL": "567",
        "MENGE": "5",
    };

    client.connect( (result:any, err:any) => {

        err ? res.json({ ok:false, message: err}) : null;

        client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [args] }, (err:any, result:any) => {

        err ? res.json({ ok: false, message: err }) : null;
            res.json({
                result
            });
        });
    });
});


export default router;