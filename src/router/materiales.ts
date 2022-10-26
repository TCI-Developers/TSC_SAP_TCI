import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { Materiales } from "../interfaces/interfaces";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";

import path from "path";

const pathViews = path.resolve(__dirname,'../views');

const materiales = Router();

materiales.get('/materiales/:type', async (req:Request, res:Response) => {

    let client:any = null;
    let   data:Materiales[] = [];
    let   arregloM:any[] = [];
    let table:string = '';
    const type   = req.params.type;

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Materiales_prod) ) :
    type == 'test' ? 
    (client = new Client(abapSystemTest), table = String(Tables.T_Materiales_test)) : null;

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
                    "to"  : table,
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
               
                 obs$.subscribe((respuesta:any) =>  res.render(`${pathViews}/proveedores.hbs` ,{ tipo:'Materiales', creados_modificados: respuesta }), (err:any) => res.json(err));
                //obs$.subscribe((respuesta:any) => res.json({ creados_modificados: respuesta }), (err:any) => res.json(err));
            });
    });

});

export default materiales;