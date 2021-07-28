import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Materiales } from "../interfaces/interfaces";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const materiales = Router();

materiales.get('/materiales', async (req:Request, res:Response) => {

    const client = new Client(abapSystem);
    let   data:Materiales[] = [];
    let   arregloM:any[] = [];

    client.connect( async (result:any, err:any) => {

    await err ? res.json({ ok:false, message: err}) : null;

    client.invoke('Z_RFC_TBL_CATALOG_MAT', { }, async (err:any, result:any) => {     
        
            await err ? res.json({ ok: false, message: err }) : null;

            //res.json(result);

            data = await result["IT_MATERIALES"];

            // data = data.filter(mat => (mat.MTART == "ZROH" || mat.MTART == "ZUNB" || mat.MTART == "ZHAL") );

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
    
                obs$.subscribe((respuesta:any) => res.json({ creados_modificados: respuesta }), (err:any) => res.json(err));
            });
    });

});

export default materiales;