import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { CorridaComparativa,    ResponseQuick,  objFinalCorrida,  Daños } from '../interfaces/interfaces';
import { pluck, timeout, retry, first } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";

const defectos = Router();


defectos.get('/defectos/:type', (req:Request, res:Response) => {

    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    let indice: number = 0;

    let resultCorrida: objFinalCorrida[] = [];



    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Lotes_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Lotes_SAP_prod)) : null;

    const body = {
        "from": table,
        "select": [ 55,14,68,6,18,12,57,20,118,70,120,121,122,123,124,125,126,127,128,129,130,131,132,71,72,73,74,75,76,77,117,113,114,115],
        "where": `{124.GT.${indice}}`
  
       
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


               let   headerData: Daños = {
         
                    Acuerdo         : item['55'].value,
                    Fecha_Corte     : item['14'].value,
                    Detalles_Acuerdo: item['68'].value,
                    Lote            : item['6'].value,
                    Orden_agranel   : item['18'].value,
                    Sagarpa         : item['12'].value,
                    Huerta          : item['57'].value,
                    Kilos_agranel   : item['20'].value,
                    Kilos_estimados : item['118'].value,
                    Tipo_corte      : item['70'].value,
                    MateriaSeca     : item['120'].value,
                    Deforme         : item['121'].value,
                    Quemadura       : item['122'].value,
                    Clavo           : item['123'].value,
                    Trips           : item['124'].value,
                    Pulpa_exp       : item['125'].value,
                    Varicela        : item['126'].value,
                    Maduro          : item['127'].value,
                    Mecanico        : item['128'].value,
                    Roña            : item['129'].value,
                    Gusano          : item['130'].value,
                    Sunblotch       : item['131'].value,
                    Rozamiento      : item['132'].value,


                }
                

                 resultCorrida.push(Corridas(headerData, String(item['71'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['72'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['73'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['74'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['75'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['76'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['77'].value )));

                 resultCorrida.push(Corridas(headerData, String(item['117'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['113'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['114'].value )));
                 resultCorrida.push(Corridas(headerData, String(item['115'].value )));



             
         
           
      
    }

    res.json({ corridas : resultCorrida });
  //  res.json({ defectos: jsonTest  }); //test
//console.log(argsResults);


});


});

function Corridas(headData:Daños, details: String): objFinalCorrida {


    let [calibre,visita,corrida,erV,calidad,erCalidad,supervisor,erS,cuadrilla,erC,material,desc] = details.split('|');

   let objtFinal: objFinalCorrida = {

    Acuerdo: headData.Acuerdo,
    Fecha_Corte: headData.Fecha_Corte,
    Detalles_Acuerdo: headData.Detalles_Acuerdo,
    Lote: headData.Lote,
    Orden_agranel: headData.Orden_agranel,
    Sagarpa: headData.Sagarpa,
    Huerta: headData.Huerta,
    Kilos_agranel: headData.Kilos_agranel,
    Kilos_estimados: headData.Kilos_estimados,
    Tipo_corte: headData.Tipo_corte,
    MateriaSeca: headData.MateriaSeca,
    Deforme: headData.Deforme,
    Quemadura: headData.Quemadura,
    Clavo: headData.Clavo,
    Trips: headData.Trips,
    Pulpa_exp: headData.Pulpa_exp,
    Varicela: headData.Varicela,
    Maduro: headData.Maduro,
    Mecanico: headData.Mecanico,
    Roña: headData.Roña,
    Gusano: headData.Gusano,
    Sunblotch: headData.Sunblotch,
    Rozamiento:headData.Rozamiento,
    Calibre: calibre,
    Calidad: calidad,
    ErrorCalidad: erCalidad,
    Material: material,
    Descripcion: desc

   };

    return objtFinal;
   





    
}


export default defectos;