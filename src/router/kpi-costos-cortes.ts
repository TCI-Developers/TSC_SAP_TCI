import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { KPICostosCortes, KPICostos } from "../interfaces/interfaces";
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
const kpicostos = Router();

kpicostos.get('/kpicostos/:type', (req:Request, res:Response) => {

    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    let kpiCostosCortes :KPICostosCortes[] = [];

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_KPICostos_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_KPICostos_SAP_test)) : null;

    const body = {
        "from": table,
        "select": [ 6, 8, 15, 51, 52, 24, 18, 76, 71,78,79 ],
        
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    //res.json({msg: body });

   ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(5),
        pluck('response')
    ).subscribe((resp:KPICostos) => {


        for (const item of resp.data) {

         kpiCostosCortes.push( {

                Sagarpa            : item['6'].value,
                Huerta             : item['8'].value,
                Acuerdo            : item['15'].value,
                Detalle_corte      : item['51'].value,
                Proveedor          : item['52'].value,
                Productor          : item['24'].value,
                Fecha              : item['18'].value,
                Kilos_recibidos    : item['76'].value,
                Monto              : item['71'].value,
                Ordenes_cuadrillas : item['78'].value,
                Ordenes_fletes     : item['79'].value,

            });

          
     
        }

       // res.json({resp});

         res.json({ KPICostosCortes : kpiCostosCortes });

    });

   // obs$.subscribe(resp =>  res.json( {  KPICostosCortes: resp }), err => res.json(err.response) );

});




export default kpicostos;