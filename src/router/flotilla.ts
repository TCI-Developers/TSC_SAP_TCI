import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
const flotilla = Router();

flotilla.get('/flotilla/:record/:proveedores', (req:Request, res:Response) => {
    const record        = req.params.record;
    const proveedores   = req.params.proveedores.split("-");

    for (const item of proveedores) {
        
    const body = {
        "from": "bqdcp8je5",
        "select": [ 651, 658, 14, 654, 644, 3 ],
        "where": `{14.EX.${record}}AND{651.EX.${item}}AND{676.EX.''}AND{182.EX.''}`
    }

    const url = 'https://api.quickbase.com/v1/records/query';

    ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    ).subscribe((resp:any[]) => {

        let IT_DATA:any = null;
        let importe = null;
        let ids:any[] = [];

        for (const item of resp) {
            ids.push(item['3']['value']);
            IT_DATA = {
                'I_PROVEEDOR'   : item['651']['value'],
                'I_FECHA_CORTE' : item['658']['value'],
                'I_TEST'        : "",
                'I_IDCORTE'     : String(item['14']['value']),
                    'IT_DATA': [{
                    'SERVICIO'      : item['654']['value'],
                    'CANTIDAD'      : "1.00",
                    'PROVEEDOR'     : item['651']['value'],
                    'UMEDIDA'       : "SER",
                    'IMPORTE'       : importe += item['644']['value'],
                    'GPO_ARTICULO'  : "",
                    'CENTRO'        : "1100"
                }]
            };
        }

        const client = new Client(abapSystem);

        client.connect( async (result:any, err:any) => {
            client.invoke("Z_RFC_VA_ENTRADAFLETE", IT_DATA , async (err:any, result:any) => {

                err ? res.json(err) : null;
                
                String(result['E_ORDEN_COMPRA']).length > 0 ? ( postBanderaTCI(res, result, ids) ) : res.json(result['IT_MESSAGE_WARNING']);
            });
        });
    });
    }
});

function postBanderaTCI(res:Response, result:any, ids:any[]) {
    const url = 'https://api.quickbase.com/v1/records';

    for (const iterator of ids) {

        const args = {
            "to"  : "bqdcp8je5",
            "data": [{
                "3"  : { "value":  iterator },
                "676" : { "value":  result.E_ORDEN_COMPRA }
            }]
        };
        ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        //ajax({ url, method: 'POST', body: args }).pipe(
            timeout(60000),
            retry(5),
            pluck('response', 'metadata')
        ).subscribe(resp => res.json(result['IT_MENSAJE_EXITOSOS']), err => res.json(err.response) );
    }
    
}

export default flotilla;