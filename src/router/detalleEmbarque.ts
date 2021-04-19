import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Embarque } from "../interfaces/interfaces";

const detalleEmbarque = Router();

detalleEmbarque.get('/detalleEmbarque/:fecha/:idEmbarque', async (req:Request, res:Response) => {

    let fecha       = req.params.fecha;
    let idEmbarque  = req.params.idEmbarque;

    const args = {
        I_FECHA  : fecha
    };

    getDetallesEmbarque(res, idEmbarque, args);

});

function getDetallesEmbarque(res:Response, idEmbarque:string, args:any) {
    const client = new Client(abapSystem)

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        client.invoke('Z_RFC_PICKINGSELLFRESH', args, async (err:any, result:any) => {
        
            await err ? res.json({ ok: false, message: err }) : null;

            postDetalleEmbarque(result, idEmbarque, res);

        });
    });
} 

function postDetalleEmbarque(result:any, idEmbarque:string, res:Response) {
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
        "to"  : "bqdcp865m",
        "data": arregloM
    };

    if(arregloM.length < 1 ) {
        res.redirect('http://54.208.145.186:4005/cliente/' + idEmbarque);
    } else {
        ajax({ createXHR, url, method: 'POST', headers, body: argsVentas }).pipe(
            timeout(60000),
            retry(5),
            pluck('response', 'metadata')
        ).subscribe(resp => {
            if(resp) {
                res.redirect('http://54.208.145.186:4005/cliente/' + idEmbarque);
            }
            }, err => res.json(err.response)
        );
    }

}

export default detalleEmbarque;