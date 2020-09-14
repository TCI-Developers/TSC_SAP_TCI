import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Proveedores } from "../interfaces/interfaces";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const proveedor = Router();

proveedor.get('/proveedores', (req:Request, res:Response) => {
    const client = new Client(abapSystem);
    let   arregloM:any[] = [];
    const url = 'https://api.quickbase.com/v1/records';

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let proveedores  :Proveedores[]  = await result["IT_PROVEEDORES"];

            proveedores.forEach(async (value) => {
                arregloM.push({
                    "71": { "value": value.LIFNR },
                    "73":  { "value": value.LAND1 },
                    "6": { "value": value.NAME1 },
                    "72": { "value": value.NAME2 },
                    "26": { "value": value.ORT01 },
                    "74": { "value": value.EKORG },
                    "75": { "value": value.ZTERM },
                    "76": { "value": value.KALSK },
                });
            });

            const argsFacturadores = {
                "to"  : "bqdcp8k48",
                "data": arregloM
            };

            const obs$ = ajax({ createXHR, url, method: 'POST', headers, body: argsFacturadores }).pipe(
                timeout(60000),
                retry(5),
                pluck('response', 'metadata', 'unchangedRecordIds')
            );

            obs$.subscribe(resp => res.json({ creados_modificados: resp }), err => res.json(err.response) );
        });
    });   
});

export default proveedor;