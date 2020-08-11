import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Proveedores } from "../interfaces/interfaces";
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'ZREC_CAB', DELIMITER:"," , FIELDS: ["IDVIAJE", "COMPRADOR", "NOMPROV"], ROWCOUNT: 5 }, (err:any, result:any) => {        
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'Z_RFC_TBL_CATALOG_PRO', DELIMITER:"," ROWCOUNT: 5 }, (err:any, result:any) => {        

const router = Router();

router.get('/materiales', (req:Request, res:Response) => {

    const client = new Client(abapSystem);
    const body = req.body;

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_MAT', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let data:Proveedores[] = await result["IT_PROVEEDORES"];

            res.json({ 
                result
            });
        });
    });
});

router.get('/proveedores', (req:Request, res:Response) => {

    const client = new Client(abapSystem);
    const body = req.body;

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let data:Proveedores[] = await result["IT_PROVEEDORES"];

            res.json({ 
                result
            });
        });
    });   
});

router.post('/acuerdo', (req:Request, res:Response) => {

    const client = new Client(abapSystem);
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

    res.json({message: "Data recibida", body});

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        client.invoke('Z_RFC_VA_PRECIOACUERDO', body, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            res.json({
                message: "Respuesta de SAP",
                result
            });
        });
    });   
});

export default router;