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
    let data:any[] = [];

    for (const item of proveedores) {
        
    const body = {
        "from": "bqdcp8je5",
        "select": [ 651, 658, 14, 654, 644 ],
        "where": `{14.EX.${record}}AND{651.EX.${item}}`
    }

    const url = 'https://api.quickbase.com/v1/records/query';

    ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    ).subscribe((resp:any[]) => {
        data = [];
        let IT_DATA:any = null;
        let importe = null;

        for (const item of resp) {
            IT_DATA = {
                'I_PROVEEDOR'   : item['651']['value'],
                'I_FECHA_CORTE' : item['658']['value'],
                'I_TEST'        : "",
                'I_IDCORTE'     : item['14']['value'],
                    'IT_DATA': [{
                    'SERVICIO'      : item['654']['value'],
                    'CANTIDAD'      : "1",
                    'PROVEEDOR'     : item['651']['value'],
                    'UMEDIDA'       : "SER",
                    'IMPORTE'       : importe += item['644']['value'],
                    'GPO_ARTICULO'  : "",
                    'CENTRO'        : "1100"
                }]
            };
        }

        //res.json(IT_DATA);

        const client = new Client(abapSystem);
        client.connect( async (result:any, err:any) => {
            client.invoke("Z_RFC_VA_ENTRADAFLETE", IT_DATA, async (err:any, result:any) => {
                err ? res.json(err) : null;
                res.json(result);
                //String(result['E_ORDEN_COMPRA']).length > 0 ? postBanderaTCI(res, result, record) : res.json(result['IT_MESSAGE_WARNING']);
            });
        });
    });
    }
});

function postBanderaTCI(res:Response, result:any, record:any){
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to"  : "bqdcp8ghy",
        "data": [{
            "1062"   : { "value":  true },
            "3"      : { "value":  record },
        }]
    };
    
    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'metadata')
    ).subscribe(resp => res.json({ resp, result }), err => res.json(err.response) );
}

export default flotilla;