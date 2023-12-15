import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import path from "path";


const pathViews = path.resolve(__dirname,'../views');

const ordenesGastos = Router();

ordenesGastos.get('/ordenesGastos/:type', async (req:Request, res:Response) => {

    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Ordenes_Fletes_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Ordenes_Fletes_test)) : null;

    let   data:any[] = [];
    let   arregloM:any[] = [];

    client.connect( async (result:any, err:any) => {

    await err ? res.json({ ok:false, message: err}) : null;

    client.invoke('Z_RFC_ORDENESGASTOS', { }, async (err:any, result:any) => {     
        
            await err ? res.json({ ok: false, message: err }) : null;

            
            data = await result["IT_ZORDENESGTOS"];

            //res.json(data);

            data.forEach(async (value) => {
                arregloM.push({
                    "6":  { "value": value.AUFNR },
                    "7":  { "value": value.KTEXT },
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
                    timeout(20000),
                    retry(1),
                    pluck('response', 'metadata')
                );
                
                obs$.subscribe((respuesta:any) => res.render(`${pathViews}/proveedores.hbs` ,{ tipo:'Ordenes de Gastos', creados_modificados: respuesta }), (err:any) => res.json(err));
              //  obs$.subscribe((respuesta:any) => res.json({ creados_modificados: respuesta }), (err:any) => res.json(err));
            });
    });

});

export default ordenesGastos;