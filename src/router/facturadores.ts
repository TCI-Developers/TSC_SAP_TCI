import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { Proveedores, Facturadores } from "../interfaces/interfaces";
import { headers, createXHR, Tables } from "../utils/utils";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
//client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {

const facturador = Router();

facturador.get('/facturadores/:type', (req:Request, res:Response) => {
    const url = 'https://api.quickbase.com/v1/records';
    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Benefeciarios_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Benefeciarios_test)) : null;
    let   arregloM:any[] = [];

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        client.invoke('Z_RFC_TBL_CATALOG_PRO', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let facturadores:Facturadores[]  = await result["IT_FACTURADORES"];

            facturadores.forEach(async (value) => {
                arregloM.push({
                    "6":  { "value": value.LIFN2 },
                    "40": { "value": value.LAND1 },
                    "7":  { "value": value.NAME1 },
                    "43": { "value": value.NAME2 },
                    "45": { "value": value.ORT01 },
                    "42": { "value": value.EKORG },
                    "39": { "value": value.LIFNR },
                    "41": { "value": value.PARVW },
                    "44": { "value": value.DEFPA },
                });
            });

            const argsFacturadores = {
                "to"  : table,
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

export default facturador;