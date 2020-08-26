import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Proveedores } from "../interfaces/interfaces";

const proveedor = Router();

proveedor.get('/proveedores', (req:Request, res:Response) => {
    const client = new Client(abapSystem);

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let data:Proveedores[] = await result["IT_FACTURADORES"];

            res.json(result);
        });
    });   
});

export default proveedor;