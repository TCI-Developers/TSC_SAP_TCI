import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { ToneladasRecibidas,Toneladas } from "../interfaces/interfaces";
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
const tonrecibidas = Router();

tonrecibidas.get('/tonrecibidas/:type', (req:Request, res:Response) => {

    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    
    let tonrecibidas :Toneladas[] = [];

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_KPICostos_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_KPICostos_SAP_test)) : null;

    const body = {
        "from": table,
        "select": [ 18, 76, 8, 74, 73,77,78,79,189,10 ],
       
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    //res.json({msg: body });


    

   ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(10000),
        retry(1),
        pluck('response')
    ).subscribe((resp:ToneladasRecibidas)  => {
        
        
       
        for (const item of resp.data) {

            tonrecibidas.push ( {

                Fecha               : item['18'].value,
                Kilos_recibidos     : item['76'].value,
                Huerta              : item['8'].value,
                Lote                : item['74'].value,
                Kilos_empaque       : item['73'].value,
                Kilos_proveedor     : item['77'].value,
                Ordenes_cuadrillas  : item['78'].value,
                Ordenes_fletes      : item['79'].value,
                Comprador           : item['189'].value,
                Municipio           : item['10'].value,


                
            });

     
        }

         res.json({ Tonrecibidas : tonrecibidas });

    });


});




export default tonrecibidas;