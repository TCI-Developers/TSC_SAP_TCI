import { Request, Response, Router } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const act = Router();

act.get('/actualizarPrecio/:record', (req:Request, res:Response) => {
    const url = 'https://api.quickbase.com/v1/records/query';
    const record = req.params.record;
    const args = {
        "from": "bqdcp8fbc",
        "select": [ 699, 688 ],
        "where": `{3.EX.${record}}`
    }

    const obs$ = ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    );

    obs$.subscribe(resp => {
        const args = {
            I_FACTURADOR    : resp[0]['688']['value'],
            I_ORDEN_COMPRA  : resp[0]['699']['value'][0]
        };

        const client = new Client(abapSystem);

        client.connect( (resul:any, er:any) => {
        er ? res.json({ ok:false, message: er}) : null;

        client.invoke('Z_RFC_VA_ACTUALIZARFACT', args, (error:any, resultado:any) => {
                error ? res.json({ ok: false, message: error }) : null;
                resultado.E_OK == "X" ? validacionActualizarPreicon(record, resultado, res) : res.json(resultado);
            });
        });
    });
});

function validacionActualizarPreicon(record:string, result:any, res:Response) {
    const argsActualizarPrecio = {
        "to"  : "bqdcp8fbc",
        "data": [{
            "703":{
                "value": "true"
            },
            "3":{
                "value": `${record}`
            }
        }]
    };

    const obs$ = ajax({
        createXHR,
        url: 'https://api.quickbase.com/v1/records',
        method: 'POST',
        headers,
        body: argsActualizarPrecio
    }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'metadata')
    );

    obs$.subscribe(resu => res.json(result['E_MESSAGE']));
}

export default act;