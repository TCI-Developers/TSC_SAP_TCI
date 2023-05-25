import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { ResponseQuick, RCalibres,Corrida,Categorias } from "../interfaces/interfaces";
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
const comparativas = Router();

comparativas.get('/comparativas/:type', (req:Request, res:Response) => {


    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    
    let calibreCorrida :Corrida[] = [];

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_KPICostos_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_KPICostos_SAP_test)) : null;

    const body = {
        "from": table,
        "select": [ 15,18,51,74,35,6,8,32,117,118,119,120,121,122,123,,175,176,177,178,179,180,181,124,125,139,182]
       
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    //res.json({msg: body });

   ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(1),
        pluck('response')
    ).subscribe((resp:ResponseQuick)  => {
           
        for ( const item of resp.data ) {

    
            calibreCorrida.push ( {

                Acuerdo         : item['15'].value,
                Fecha_Corte     : item['18'].value,
                Detalles_Acuerdo: item['51'].value,
                Lote            : item['74'].value,
                Orden_agranel   : item['35'].value,
                Sagarpa         : item['6'].value,
                Huerta          : item['8'].value,
                Kilos_agranel   : item['32'].value,
                Calibre32       : Calibres(String(item['117'].value )),
                Calibre36       : Calibres(String(item['118'].value )),
                Calibre40       : Calibres(String(item['119'].value )),
                Calibre48       : Calibres(String(item['120'].value )),
                Calibre60       : Calibres(String(item['121'].value )),
                Calibre70       : Calibres(String(item['122'].value )),
                Calibre84       : Calibres(String(item['123'].value )),

                Calibre32B       : Calibres(String(item['175'].value )),
                Calibre36B       : Calibres(String(item['176'].value )),
                Calibre40B       : Calibres(String(item['177'].value )),
                Calibre48B       : Calibres(String(item['178'].value )),
                Calibre60B       : Calibres(String(item['179'].value )),
                Calibre70B       : Calibres(String(item['180'].value )),
                Calibre84B       : Calibres(String(item['181'].value )),

                Categoria1      : Categ(String(item['124'].value )),
                Categoria2      : Categ(String(item['125'].value )),
                Nacional        : Categ(String(item['139'].value )),
                Canica          : Categ(String(item['182'].value )),

                
            });

        }
    
         res.json({ corridas : calibreCorrida });

    });


});

function Calibres( calibreCorrida:  string ): RCalibres {

    let [visita,corrida,er,material,desc] = calibreCorrida.split('-');

    const  result: RCalibres = {
                
       
        Visita      : Number(visita),
        Corrida     : Number(corrida),
        Error       : Number(er),
        Material    : material,
        Descripcion : desc
       

    } ;
    return result;
}

function Categ( calibreCorrida:  string ): Categorias {

    let [visita,corrida,er] = calibreCorrida.split('-');

    const  cat: Categorias = {
                 
        Visita      : Number(visita),
        Corrida     : Number(corrida),
        Error       : Number(er),
       
    } ;
    return cat;
}




export default comparativas;