import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { Forecast } from "../interfaces/interfaces";
import { headers, createXHR, Tables, codigosExito } from '../utils/utils';
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import path from "path";

const pathViews = path.resolve(__dirname,'../views');

const forecast = Router();

forecast.get('/forecast/:type', (req:Request, res:Response) => {
   
    const url = 'https://api.quickbase.com/v1/records';
    const type = req.params.type;
    let table:string = '';
    let client:any = null;

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Forecast_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Forecast_SAP_test)) : null;

    let   arregloM:any[] = [];

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        client.invoke('Z_RFC_TBL_CATALOG_FORE_REQ', { }, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let forecastResult:Forecast[]  = await result["IT_FORECAST"];



        forecastResult.forEach(async (value) => {

            let anio = value.DAT00.substring(0,4);
            let mes  = value.DAT00.substring(4,6);
            let dia  = value.DAT00.substring(6,8);

            //FECHA DOS
            let anioUMDAT =  value.UMDAT.substring(0,4);
            let mesUMDAT  =  value.UMDAT.substring(4,6);
            let diaUMDAT  =  value.UMDAT.substring(6,8);

                arregloM.push({
                    "6":  { "value": value.MATNR },
                    "25": { "value": value.MAKTX },
                    "8":  { "value": value.MENGE },
                    "26": { "value": value.MEINS },
                    "10": { "value": value.VBELN },
                    "11": { "value": value.POSNR },
                    "12": { "value": value.PLNUM },
                    "13": { "value": anio+"-"+mes+"-"+dia },
                    "27": { "value": value.EXTRA },
                    "28": { "value": value.DELB0 },
                    "29": { "value": value.KUNNR },
                    "30": { "value": value.MD4KD },
                    "32": { "value":  anioUMDAT+"-"+mesUMDAT+"-"+diaUMDAT },     
                });
            });
         
            const argsForescast = {
                "to"  : table,
                "data": arregloM
            };

       //res.json( arregloM[0] );

            
         
          const obs$ = ajax({ createXHR, url, method: 'POST', headers, body: argsForescast }).pipe(
                timeout(60000),
                retry(5),
                pluck('response', 'metadata')
            );
            
            obs$.subscribe((respuesta:any) => res.json({ creados_modificados: respuesta }), (err:any) => res.json(err));
        
            //obs$.subscribe(resp =>  res.render(`${pathViews}/proveedores.hbs` ,{ tipo:'Forecast', creados_modificados: resp }), err => res.json(err.response) );
                    

            });
    });   
});

export default forecast;