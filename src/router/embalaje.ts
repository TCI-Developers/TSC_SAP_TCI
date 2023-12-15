import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Embalaje } from "../interfaces/interfaces";

const embalaje = Router();

embalaje.get('/embalaje/:type', (req:Request, res:Response) => {

    let   data:Embalaje[] = [];
    let   arregloM:any[] = [];
    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Productos_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Productos_test)) : null;

    client.connect( async (result:any, err:any) => {
        await err ? res.json({ ok:false, message: err}) : null;;

        client.invoke('Z_RFC_NORMA_EMBALAJE', { } , async (err:any, result:any) => {

            await err ? res.json({ ok: false, message: err }) : null;

            data = await result["IT_PACKPS"];

            data.forEach(async (value) => {
                arregloM.push({
                    "6" :  { "value": value.CONTENT },
                    "7" :  { "value": value.POBJID },
                    "43":  { "value": value.PACKNR }
                });
            });

            const args = {
                "to"  : table,
                "data": arregloM
            };

            ajax({ createXHR, url: 'https://api.quickbase.com/v1/records', method: 'POST', headers, body: args }).pipe(
                timeout(10000),
                retry(1),
                pluck('response', 'metadata')
            ).subscribe(respuesta => res.json({ creados_modificados: respuesta }), err => res.json(err));
        });
    }); 
});

export default embalaje;