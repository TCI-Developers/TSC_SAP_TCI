import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Cuadrillas, Proveedores } from "../interfaces/interfaces";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const proveedor = Router();

proveedor.get('/proveedores/:id', (req:Request, res:Response) => {
    const id = req.params.id;
    const client = new Client(abapSystem);
    let   arregloM:any[] = [];
    let   arregloC:any[] = [];
    let   arregloT:any[] = [];
    const url = 'https://api.quickbase.com/v1/records';

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let proveedores  :Proveedores[]  = await result["IT_PROVEEDORES"];

            proveedores.forEach(async (value) => {
                if(value.IND_SECTOR == "") {
                    arregloM.push({
                        "71": { "value": value.LIFNR },
                        "73": { "value": value.LAND1 },
                        "6":  { "value": value.NAME1 },
                        "72": { "value": value.NAME2 },
                        "26": { "value": value.ORT01 },
                        "74": { "value": value.EKORG },
                        "75": { "value": value.ZTERM },
                        "76": { "value": value.KALSK },
                    });
                } else if (value.IND_SECTOR == "0008") { 
                    arregloC.push({
                        "176": { "value": value.LIFNR },
                        "177": { "value": value.LAND1 },
                        "7":   { "value": value.NAME1 },
                        //"72": { "value": value.NAME2 },
                        "178": { "value": value.ORT01 },
                        "179": { "value": value.EKORG },
                        "180": { "value": value.ZTERM },
                        "181": { "value": value.IND_SECTOR },
                        "182": { "value": value.TEXT },
                    });
                }
                else if (value.IND_SECTOR == "0007") { 
                    arregloT.push({
                        "16": { "value": value.LIFNR },
                        "17": { "value": value.LAND1 },
                        "11": { "value": value.NAME1 },
                        "18": { "value": value.ORT01 },
                        "19": { "value": value.EKORG },
                        "20": { "value": value.ZTERM },
                        "21": { "value": value.IND_SECTOR },
                        "22": { "value": value.TEXT },
                    });
                }
            });

            const argsFacturadores = {
                "to"  : "bqdcp8k48",
                "data": arregloM
            };

            const argsCuadrilla = {
                "to"  : "bqdcp8k4f",
                "data": arregloC
            };

            const argsTransporte = {
                "to"  : "bqmyekd8t",
                "data": arregloT
            };

            //res.json(result);

            const obs1$ = ajax({ createXHR, url, method: 'POST', headers, body: argsFacturadores }).pipe(
                timeout(60000),
                retry(5),
                pluck('response', 'metadata', 'unchangedRecordIds')
            );

            const obs2$ = ajax({ createXHR, url, method: 'POST', headers, body: argsCuadrilla }).pipe(
                timeout(60000),
                retry(5),
                pluck('response', 'metadata', 'unchangedRecordIds' )
            );

            const obs3$ = ajax({ createXHR, url, method: 'POST', headers, body: argsTransporte }).pipe(
                timeout(60000),
                retry(5),
                pluck('response' )
            );


            if(id == "1") {
                obs1$.subscribe(resp => res.json({ creados_modificados: resp }), err => res.json(err.response) );
            } else if (id == "2"){
                obs2$.subscribe(resp => res.json({ creados_modificados: resp }), err => res.json(err.response) );
            } else if (id == "3"){
                obs3$.subscribe(resp => res.json({ creados_modificados: resp }), err => res.json(err.response) );
            }

        });
    });   
});

export default proveedor;