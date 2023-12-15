import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { ResponseQuick, Huertas, costoxCorte, salidasEnFalso, Acuerdo } from '../interfaces/interfaces';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
const salidasEnFalso = Router();

salidasEnFalso.get('/salidas-en-falso/:type', (req:Request, res:Response) => {


    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    
    let sfalso :salidasEnFalso[] = [];

    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_DetalleA_SAP_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_DetalleA_SAP_test)) : null;

    const body = {
        "from": table,
        "select": [ 1009,19,1116,1110,1072,1051,1105,1106,1114,1045,1115,1109]
       
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    //res.json({msg: body });

   ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(10000),
        retry(1),
        pluck('response')
    ).subscribe((resp:ResponseQuick)  => {
           
        for ( const item of resp.data ) {

    
            sfalso.push ( {

                Fecha               : item['1009'].value,
                Acuerdo             : item['19'].value,
                Estatus             : item['1116'].value,
                Incidencia          : item['1110'].value,
                OrdenCompra         : item['1072'].value,
                CostoAcarreo        : item['1051'].value,
                OrdenCorteCuadrilla : item['1105'].value,
                CostoCuadrilla      : item['1106'].value,
                Agricultor          : item['1114'].value,
                ProveedorAcarreo    : item['1045'].value,
                ProveeedorCosecha   : item['1115'].value,
                Zona                : item['1109'].value,
             });

        }
    
         res.json({ SalidasEnFalso : sfalso });

    });


});






export default salidasEnFalso;