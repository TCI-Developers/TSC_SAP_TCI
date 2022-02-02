import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { Cuadrillas, Proveedores } from "../interfaces/interfaces";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";

const proveedor = Router();

proveedor.get('/proveedores/:id/:type', (req:Request, res:Response) => {
    const id = req.params.id;
    const type = req.params.type;
    let table1:string = '';
    let table2:string = '';
    let table3:string = '';
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem),
     table1 = String(Tables.T_Productor_prod),
     table2 = String(Tables.T_Cuadrillas_prod),
     table3 = String(Tables.T_Transportes_prod)
     ) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest),
        table1 = String(Tables.T_Productor_test),
        table2 = String(Tables.T_Cuadrillas_test),
        table3 = String(Tables.T_Transportes_test)) : null;
    let   arregloM:any[] = [];
    let   arregloC:any[] = [];
    let   arregloT:any[] = [];
    const url = 'https://api.quickbase.com/v1/records';

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            //return res.json(result);

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
                "to"  :  table1,
                "data": arregloM
            };

            const argsCuadrilla = {
                "to"  : table2,
                "data": arregloC
            };

            const argsTransporte = {
                "to"  : table3,
                "data": arregloT
            };

            //res.json(proveedores);

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