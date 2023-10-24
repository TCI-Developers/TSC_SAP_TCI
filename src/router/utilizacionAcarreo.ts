import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { ResponseQuick, UtilAcarreo } from "../interfaces/interfaces";
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";


const utilizacionAcarreo = Router();

utilizacionAcarreo.get('/aucarreo/:type', (req:Request, res:Response) => {

    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    
    let utilAcarreo :UtilAcarreo[] = [];

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_DetalleA_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_DetalleA_SAP_test)) : null;

    const body = {
        "from": table,
        "select": [ 43, 1043, 93, 1072, 138,19,3,138,1103 ],
       
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    //res.json({msg: body });

   ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(1),
        pluck('response')
    ).subscribe((resp:ResponseQuick)  => {
        
        
       
        for (const item of resp.data) {

            utilAcarreo.push ( {

                Fecha           : item['43'].value,
                TipoTransporte  : item['1043'].value,
                Kilogramos      : item['93'].value,
                OrdenCompra     : item['1072'].value,
                Capacidad       : item['138'].value,
                Acuerdo         : item['19'].value,
                DetalleAcuerdo  : item['3'].value,
                NumeroCajas     : item['138'].value,
                CostoCorte      : item['1103'].value,



                
            });

     
        }

         res.json({ UtAcarreo : utilAcarreo });

    });


});


export default utilizacionAcarreo;