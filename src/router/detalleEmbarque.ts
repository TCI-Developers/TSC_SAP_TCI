import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { Embarque } from "../interfaces/interfaces";

import path from "path";


const pathViews = path.resolve(__dirname,'../views');

const detalleEmbarque = Router();

detalleEmbarque.get('/detalleEmbarque/:fecha/:idEmbarque/:type', async (req:Request, res:Response) => {

    let fecha       = req.params.fecha;
    let idEmbarque  = req.params.idEmbarque;
    const type = req.params.type;
    let table:string = '';
    const args = {
        I_FECHA  : fecha
    };

    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Det_Embarques_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Det_Embarques_test)) : null;

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        client.invoke('Z_RFC_PICKINGSELLFRESH', args, async (err:any, result:any) => {
        
            await err ? res.json({ ok: false, message: err }) : null;

            postDetalleEmbarque(result, idEmbarque, res, table);

        });
    });

});

function postDetalleEmbarque(result:any, idEmbarque:string, res:Response, table:string) {
    let   arregloM:any[] = [];
    const url = 'https://api.quickbase.com/v1/records';
    let embarques:Embarque[] = result["IT_EMBARQUEVTA"];

    embarques = embarques.filter(val => val.VBELN === idEmbarque);

    embarques.forEach(async (value) => {
        arregloM.push({
            "22": { "value": idEmbarque },
            "28": { "value": value.VBELN+"-"+value.POSNN }
        });
    });

    const argsVentas = {
        "to"  : table,
        "data": arregloM
    };
    

    if(arregloM.length < 1 ) {
        //res.redirect('http://54.208.145.186:4005/cliente/' + idEmbarque);

        res.json({ mgs:'No se encontro informacion relacionada al embarque' + idEmbarque });
    } else {
        ajax({ createXHR, url, method: 'POST', headers, body: argsVentas }).pipe(
            timeout(60000),
            retry(1),
            pluck('response', 'metadata')
        ).subscribe(resp => {
            if(resp) {
               // res.json(resp);
                res.render(`${pathViews}/proveedores.hbs` ,{ tipo:'Detalles de embarque', creados_modificados: resp })
               // res.redirect('http://54.208.145.186:4005/cliente/' + idEmbarque);
            }
            }, err => res.json(err.response)
        );
    }

}

export default detalleEmbarque;