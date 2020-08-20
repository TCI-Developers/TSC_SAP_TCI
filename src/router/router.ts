import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Proveedores, Materiales } from "../interfaces/interfaces";
import {ajax} from 'rxjs/ajax';
import { map, catchError, pluck, timeout, retry } from 'rxjs/operators';
import { of } from 'rxjs';
import { headers, createXHR } from "../utils/utils";

const router = Router();

router.get('/materiales', (req:Request, res:Response) => {

    const client = new Client(abapSystem);
    let   data:Materiales[] = [];
    let   arregloM:any[] = [];

    client.connect( async (result:any, err:any) => {

    await err ? res.json({ ok:false, message: err}) : null;

    client.invoke('Z_RFC_TBL_CATALOG_MAT', { }, async (err:any, result:any) => {     
        
            await err ? res.json({ ok: false, message: err }) : null;

            data = await result["IT_MATERIALES"];

            data = data.filter(mat => (mat.MTART == "ZROH" || mat.MTART == "ZHAL") );

            data.forEach(async (value) => {
                arregloM.push({
                    "6":  { "value": value.MATNR },
                    "7":  { "value": value.MTART },
                    "8":  { "value": value.MATKL },
                    "9":  { "value": value.MEINS },
                    "10": { "value": value.BRGEW },
                    "11": { "value": value.NTGEW },
                    "12": { "value": value.MAKTG }
                });
            });
          
            const args = {
                "to"  : "bqrxem5py",
                "data": arregloM
            };
   
                const obs$ = ajax({
                    createXHR,
                    url: 'https://api.quickbase.com/v1/records',
                    method: 'POST',
                    headers,
                    body: args
                }).pipe(
                    timeout(60000),
                    retry(5),
                    pluck('response', 'metadata')
                );
    
               obs$.subscribe(respuesta => res.json(respuesta), err => res.json(err));
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
    const args1 = {
        "from": "bqdcp8fbc",
        "select": [ 675, 676, 667, 677, 29, 669],
        "where": `{58.EX.${fecha}}`
    }
    const args2 = {
        "to"  : "bqdcp8wnc",
        "data": [{
            "117":{
                "value": "true"
            },
            "6":{
                "value": `${fecha}`
            }
        }]
    };

    const obs$ = ajax({
        createXHR,
        url: 'https://api.quickbase.com/v1/records/query',
        method: 'POST',
        headers,
        body: args1
    }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    );
    
    obs$.subscribe((result:any[]) => {
        result.length < 1 ? res.json('No hay acuerdos que mandar') : null;

        result.forEach(value => {
            const args = {
                FECHA           : String(value['675']['value']),
                USUARIO         : String(value['676']['value']['email']),
                PROVEEDOR       : String(value['667']['value'][0]),
                OPERACION       : String(value['677']['value']),
                MATERIAL        : "",
                GRUPO_MATERIAL  : "001",
                PRECIO          : String(value['29']['value']+".00").substring(0,5),
                MONEDA          : String(value['669']['value']),
                CORTE           : "",
                ORDEN_COMPRA    : ""
            };

            args.FECHA     == ""  ? res.json('No se mando Fecha') : 
            args.USUARIO   == ""  ? res.json('No se mando Usuario') :
            args.PROVEEDOR == ""  ? res.json('No se mando Proveedor') :
            args.OPERACION == ""  ? res.json('No se mando Operacion') :
            args.PRECIO    == ""  ? res.json('No se mando Precio') :
            args.MONEDA    == ""  ? res.json('No se mando Moneda') : null;

            const client = new Client(abapSystem);
            client.connect( (resul:any, er:any) => {

            er ? res.json({ ok:false, message: er}) : null;

            client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (err:any, resultado:any) => {
                err ? res.json({ ok: false, message: err }) : null;

                const obs$ = ajax({
                    createXHR,
                    url: 'https://api.quickbase.com/v1/records',
                    method: 'POST',
                    headers,
                    body: args2
                }).pipe(
                    timeout(60000),
                    retry(5),
                    pluck('response', 'metadata')
                );
                    
                   String(resultado['MENSAJE']).substring(1,3) == "100" ? obs$.subscribe(respuesta => res.json({ respuesta, resultado }), err => res.json(err)) : res.json('Algo salio mal.');
                });
            });
        });
    }, 
    errors => {
        res.json(errors);
    });
});

export default router;