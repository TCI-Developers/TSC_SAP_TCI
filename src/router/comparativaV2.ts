import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { Categoria1, Categorias, CategoriasV2, CorridaComparativa, RCalibres, RCalibresv2, ResponseJson, ResponseQuick, Cuadrillas, Categoria1V2, HeaderCorrida, objFinalCorrida, Acuerdo, Huertas } from '../interfaces/interfaces';
import { pluck, timeout, retry, first } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
const comparativasV2 = Router();

comparativasV2.get('/comparativas/v2/:type', (req:Request, res:Response) => {


    const type = req.params.type;
    let table:string = '';
    let client:any = null;

    var json: CorridaComparativa;
    

  
   let argsResults : any[] = [];
   let resultCorrida: objFinalCorrida[] = [];


    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Lotes_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Lotes_SAP_prod)) : null;

    const body = {
        "from": table,
        "select": [ 55,14,68,6,18,12,57,20,118,70,120,71,72,73,74,75,76,77,117,113,114,115,145,146,147,148,149,150,151,227,269,270,271,272,273,274,275,276,277,278,279]
       
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


                let   headerData: HeaderCorrida = {
         
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
                    MateriaSeca     :  item['120'].value
                }
                

                 resultCorrida.push(Corridas(headerData, String(item['71'].value ),'Categoria 1'));
                 resultCorrida.push(Corridas(headerData, String(item['72'].value ),'Categoria 1'));
                 resultCorrida.push(Corridas(headerData, String(item['73'].value ),'Categoria 1'));
                 resultCorrida.push(Corridas(headerData, String(item['74'].value ),'Categoria 1'));
                 resultCorrida.push(Corridas(headerData, String(item['75'].value ),'Categoria 1'));
                 resultCorrida.push(Corridas(headerData, String(item['76'].value ),'Categoria 1'));
                 resultCorrida.push(Corridas(headerData, String(item['77'].value ),'Categoria 1'));  

                 resultCorrida.push(Corridas(headerData, String(item['145'].value ),'Categoria 2'));
                 resultCorrida.push(Corridas(headerData, String(item['146'].value ),'Categoria 2'));
                 resultCorrida.push(Corridas(headerData, String(item['147'].value ),'Categoria 2'));
                 resultCorrida.push(Corridas(headerData, String(item['148'].value ),'Categoria 2'));
                 resultCorrida.push(Corridas(headerData, String(item['149'].value ),'Categoria 2'));
                 resultCorrida.push(Corridas(headerData, String(item['150'].value ),'Categoria 2'));
                 resultCorrida.push(Corridas(headerData, String(item['151'].value ),'Categoria 2')); 


               //  resultCorrida.push(Corridas(headerData, String(item['117'].value ),'Canica'));
                 resultCorrida.push(Corridas(headerData, String(item['269'].value ),'Canica'));
                 resultCorrida.push(Corridas(headerData, String(item['270'].value ),'Canica'));
                 resultCorrida.push(Corridas(headerData, String(item['113'].value ),'T Categoria 1'));
                 resultCorrida.push(Corridas(headerData, String(item['114'].value ),'T Categoria 2'));
                 // resultCorrida.push(Corridas(headerData, String(item['115'].value ),'Nacional'));
                 resultCorrida.push(Corridas(headerData, String(item['271'].value ),'Nacional'));
                 resultCorrida.push(Corridas(headerData, String(item['272'].value ),'Nacional'));
                 resultCorrida.push(Corridas(headerData, String(item['273'].value ),'Nacional'));
                 resultCorrida.push(Corridas(headerData, String(item['274'].value ),'Nacional'));
                 resultCorrida.push(Corridas(headerData, String(item['275'].value ),'Nacional'));
                 resultCorrida.push(Corridas(headerData, String(item['276'].value ),'Nacional'));
                 //resultCorrida.push(Corridas(headerData, String(item['227'].value ),'Merma'));
                 resultCorrida.push(Corridas(headerData, String(item['277'].value ),'Merma'));
                 resultCorrida.push(Corridas(headerData, String(item['278'].value ),'Merma'));
                 resultCorrida.push(Corridas(headerData, String(item['279'].value ),'Merma'));
           
    }

    res.json({ corridas : resultCorrida });
    


});


});

function Corridas(headData:HeaderCorrida, details: String, categoria: String): objFinalCorrida {

    
    let [calibre,visita,corrida,erV,calidad,erCalidad,supervisor,erS,cuadrilla,erC,material,desc,kg] = details.split('|');

    


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
    Calibre: calibre,
    Visita: visita,
    Corrida: corrida,
    ErrorVisita: erV,
    Calidad: calidad,
    ErrorCalidad: erCalidad,
    Supervisor: supervisor,
    ErrorS: erS,
    Cuadrilla: cuadrilla,
    ErrorC: erC,
    Material: material,
    Descripcion: desc,
    Categoria: categoria.toString(),
    Kilogramos: Number(kg),




   };

    return objtFinal;
      
}

export default comparativasV2;