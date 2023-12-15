import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Cliente } from "../interfaces/interfaces";

const cliente = Router();

cliente.get('/cliente/:embarque/:type', (req:Request, res:Response) => {

    const url = 'https://api.quickbase.com/v1/records';

    const embarque:string = req.params.embarque;
    const type = req.params.type;
    let client:any = null;
    let table:string ='';
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Embarques_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Embarques_test)) : null;

    client.connect( async (result:any, err:any) => {
        await err ? res.json({ ok:false, message: err}) : null;

        const args = {
            I_VBELN  : embarque
        };

        client.invoke('Z_RFC_DESTINOEMBARQUE', args , async (err:any, result:any) => {

            await err ? res.json({ ok: false, message: err }) : null;

            let embarques:Cliente[] = result["IT_DELIVERY"];
            let   arregloM:any[] = [];

            embarques.forEach(async (value) => {
                arregloM.push({
                    "119": { "value" : value.NAME1 },
                    "120": { "value" : value.CITY1 },
                    "121": { "value" : value.CP    },
                    "122": { "value" : value.CALLE },
                    "123": { "value" : value.NUM   },
                    "74" : { "value" : embarque    },
                });
            });

            const argsVentas = {
                "to"  : table,
                "data": arregloM
            };

            ajax({ createXHR, url, method: 'POST', headers, body: argsVentas }).pipe(
                timeout(10000),
                retry(1),
                pluck('response', 'metadata')
            ).subscribe(resp => res.json( { registros_creados : resp} )
                , err => res.json(err.response)
            );
        });
    }); 
});

export default cliente;