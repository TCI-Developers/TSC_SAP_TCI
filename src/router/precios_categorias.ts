import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import {  ResponseQuick,  preciosStatus, preciosCategorias } from '../interfaces/interfaces';
import { pluck, timeout, retry, first } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";

const precios = Router();

precios.get('/precios/:type', (req:Request, res:Response) => {


    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    let status ='Activo';

   let resultCorrida: preciosCategorias[] = [];


    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Precios_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Precios_SAP_test)) : null;

    const body = {
        "from": table,
        "select": [ 25,26,31,32,33,34,35,36,37,38,39,40,41,42,43,44],
        "where": `{44.EX.${status}}`   
    }

    const url = 'https://api.quickbase.com/v1/records/query';

   ajax(
        { createXHR, url, method: 'POST', headers, body }).pipe(
        first(),
        timeout(20000),
        retry(1),
        pluck('response')
        ).subscribe((resp:ResponseQuick)  => {

            for ( const item of resp.data ) {

                let   headerData: preciosStatus = {
         
                    status         : item['44'].value,
                    fecha_inicio   : item['25'].value,
                    fecha_final    : item['26'].value,
                    
                }
             
                resultCorrida.push(preciosCat(headerData, String(item['31'].value )));
                resultCorrida.push(preciosCat(headerData, String(item['32'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['33'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['34'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['35'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['36'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['37'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['38'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['39'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['40'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['41'].value ))); 
                resultCorrida.push(preciosCat(headerData, String(item['42'].value )));               
                resultCorrida.push(preciosCat(headerData, String(item['43'].value )));               
              
               
    }

    res.json({ corridas : resultCorrida });

});

});

function preciosCat(headData:preciosStatus, details: String): preciosCategorias {
 
    let [tipo,cat1,cat2] = details.split('|');

    let objtFinal: preciosCategorias = {

    status: headData.status,
    fecha_inicio: headData.fecha_inicio,
    fecha_final: headData.fecha_final,
    calibre: tipo,
    cat_1: parseFloat(cat1),
    cat_2: parseFloat(cat2),
   };

    return objtFinal;    
}

export default precios;