import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const resultadoCorrida = Router();

resultadoCorrida.get('/resultadoCorrida/:ordenCompraAgranel', (req:Request, res:Response) => {

    const ordenCompra:string = req.params.ordenCompraAgranel;
    

    const client = new Client(abapSystem);

    client.connect( async (result:any, err:any) => {
        await err ? res.json({ ok:false, message: err}) : null;

        const args = {
            I_ORDENCOMPRA  : ordenCompra
        };

        client.invoke('Z_RFC_RESULTOC_RDM', args , async (err:any, result:any) => {

            await err ? res.json({ ok: false, message: err }) : null;

            postResultado(res, result);
        });
    }); 
});

function postResultado(res:Response, result:any) {
    const url = 'https://api.quickbase.com/v1/records';
       
    const args = {
        "to"  : "brhh5xmxa",
        "data": [{
            "6"     : { "value":  result.EBELN },
            "7"     : { "value":  result.EBELP },
            "11"    : { "value":  result.MATNR },
            "8"     : { "value":  result.MENGE },
            "9"     : { "value":  result.MEINS },
            "12"    : { "value":  result.CHARG },
            "10"    : { "value":  result.BUDAT }
        }]
    };

    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        //pluck('response', 'metadata')
    ).subscribe(resp => res.json({SAP: result, TCI: resp.response.metadata}) ); 
}

export default resultadoCorrida;