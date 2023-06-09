import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { ResponseQuick, RCalibres,Corrida,Categorias, Huertas } from "../interfaces/interfaces";
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
const huertas = Router();

huertas.get('/huertas/:type', (req:Request, res:Response) => {


    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    
    let huertas :Huertas[] = [];

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Huertas_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Huertas_SAP_test)) : null;

    const body = {
        "from": table,
        "select": [ 6,115,7,9,10]
       
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    //res.json({msg: body });

   ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(5),
        pluck('response')
    ).subscribe((resp:ResponseQuick)  => {
           
        for ( const item of resp.data ) {

    
            huertas.push ( {

                Nombre        : item['6'].value,
                Localidad     : item['115'].value,
                Sagarpa       : item['7'].value,
                Municipio     : item['9'].value,
                Organico      : item['10'].value,
             });

        }
    
         res.json({ huertas : huertas });

    });


});






export default huertas;