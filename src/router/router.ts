import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Proveedores, Materiales } from "../interfaces/interfaces";
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'ZREC_CAB', DELIMITER:"," , FIELDS: ["IDVIAJE", "COMPRADOR", "NOMPROV"], ROWCOUNT: 5 }, (err:any, result:any) => {        
//client.invoke('RFC_READ_TABLE', { QUERY_TABLE: 'Z_RFC_TBL_CATALOG_PRO', DELIMITER:"," ROWCOUNT: 5 }, (err:any, result:any) => {
import {ajax} from 'rxjs/ajax';
import { map, catchError, pluck, timeout, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { headers, createXHR } from "../utils/utils";

const router = Router();

router.get('/materiales', (req:Request, res:Response) => {

    const client = new Client(abapSystem);

     client.connect( async (result:any, err:any) => {

     await err ? res.json({ ok:false, message: err}) : null;

    //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
     client.invoke('Z_RFC_TBL_CATALOG_MAT', { }, async (err:any, result:any) => {        
        
         await err ? res.json({ ok: false, message: err }) : null;

         let data:Materiales[] = await result["IT_MATERIALES"];

         res.json( data );
     });
 });
});

router.get('/proveedores', (req:Request, res:Response) => {
    const client = new Client(abapSystem);

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let data:Proveedores[] = await result["IT_FACTURADORES"];

            res.json(data);
        });
    });   
});

router.get('/acuerdo/:fecha', (req:Request, res:Response) => {
    const fecha = req.params.fecha;
    const argsQ = {
        "from": "bqdcp8fbc",
        "select": [ 675, 676, 667, 677, 29, 669],
        "where": `{58.EX.${fecha}}`
    } 

    const obs$ = ajax({
        createXHR,
        url: 'https://api.quickbase.com/v1/records/query',
        method: 'POST',
        headers,
        body: argsQ
    }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data'),
        map((resp) => resp),
        catchError(error => {
            res.json(error);
            return of(error);
        })
    );
    
    obs$.subscribe(result => {
        try {
            const args = {
                FECHA: result[0]['675']['value'],
                USUARIO: result[0]['676']['value']['email'],
                PROVEEDOR: result[0]['667']['value'][0],
                OPERACION: result[0]['677']['value'],
                MATERIAL: "",
                GRUPO_MATERIAL: "001",
                PRECIO: String(result[0]['29']['value']+".00").substring(0,5),
                MONEDA: result[0]['669']['value'],
                CORTE: "",
                ORDEN_COMPRA: ""
            };
        
           const client = new Client(abapSystem);
            client.connect( (resul:any, er:any) => {
    
               er ? res.json({ ok:false, message: er}) : null;
        
                client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (err:any, resultado:any) => {
                    if(err){
                        return res.json({ ok: false, message: err })
                    }
        
                    res.json({
                        message: "Respuesta de SAP",
                        resultado
                    });
                });
            });
        } catch (error) {
            res.json(error);
        }
        
    }, errors => {
        res.json(errors);
    });  
});

export default router;