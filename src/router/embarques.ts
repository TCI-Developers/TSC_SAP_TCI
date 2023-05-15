import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { Embarque } from "../interfaces/interfaces";

import path from "path";


const pathViews = path.resolve(__dirname,'../views');

const embarque = Router();

embarque.get('/embarque/:fecha/:type', (req:Request, res:Response) => {
    const url = 'https://api.quickbase.com/v1/records';
    let fecha = req.params.fecha;
    const type = req.params.type;
    const args = {
        I_FECHA  : fecha
    };
    let table:string ='';
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Embarques_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Embarques_test)) : null;
    let   arregloM:any[] = [];

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        client.invoke('Z_RFC_PICKINGSELLFRESH', args, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let embarques:Embarque[]  = await result["IT_EMBARQUEVTA"];

            embarques.forEach(async (value) => {
                arregloM.push({
                    "74":  { "value": value.VBELN },
                    "75":  { "value": value.VBELV },
                    // "76":  { "value": value.POSNV },
                    // "77":  { "value": value.POSNN },
                    // "78": { "value": value.VBTYP_N },
                    // "79": { "value": value.RFMNG },
                    // "80": { "value": value.MEINS }
                });
            });

            const argsVentas = {
                "to"  : table,
                "data": arregloM
            };

            // res.json(argsVentas);

            ajax({ createXHR, url, method: 'POST', headers, body: argsVentas }).pipe(
                timeout(60000),
                retry(1),
                pluck('response', 'metadata')
            ).subscribe(resp => res.render(`${pathViews}/proveedores.hbs` ,{ tipo:'Embarques', registros_creados: resp }), (err:any) => res.json(err));
            //subscribe(resp => res.json( { registros_creados : resp} ), err => res.json(err.response) );
        });
    }); 

});

export default embarque;