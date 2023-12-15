import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { ResponseQuick, Huertas, costoxCorte } from '../interfaces/interfaces';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
const costoCorte = Router();

costoCorte.get('/costocorte/:type', (req:Request, res:Response) => {


    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    
    let costosC :costoxCorte[] = [];

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_DetalleA_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_DetalleA_SAP_test)) : null;

    const body = {
        "from": table,
        "select": [ 1009,30,1072,1051,1105,1106,29,19,1108,1109,21]
       
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    //res.json({msg: body });

   ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(10000),
        retry(1),
        pluck('response')
    ).subscribe((resp:ResponseQuick)  => {
           
        for ( const item of resp.data ) {

    
            costosC.push ( {

                Fecha        : item['1009'].value,
                CostoFruta     : item['30'].value,
                OrdenCompra       : item['1072'].value,
                CostoAcarreo     : item['1051'].value,
                OrdenCorteCuadrilla      : item['1105'].value,
                CostoCuadrilla      : item['1106'].value,
                TipoCorte      : item['29'].value,
                Acuerdo      : item['19'].value,
                Lote      : item['1108'].value,
                Municipio      : item['1109'].value,
                Comprador      : item['21'].value,
             });

        }
    
         res.json({ costoxCorte : costosC });

    });


});






export default costoCorte;