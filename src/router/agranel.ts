import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";

const agranel = Router();

agranel.get('/agranel/:record', (req:Request, res:Response) => {
    const record = req.params.record;
    const body = {
        "from": "bqdcp8ghy",
        "select": [ 1029, 1022, 1021, 1030, 1024, 1028, 1026, 1031, 1032, 1014, 1034],
        "where": `{3.EX.${record}}`
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    ).subscribe(resp => {
        
        const IT_DATA = {
            'I_FECHA_CORTE' : resp[0]['1029']['value'],
            'I_FACTURADOR'  : resp[0]['1022']['value'],
            'I_PROVEEDOR'   : resp[0]['1021']['value'],
            'I_IDCORTE'     : resp[0]['1030']['value'],
                'IT_DATA': [{
                'MATERIAL'      : resp[0]['1024']['value'][0],
                'CANTIDAD'      : resp[0]['1028']['value'],
                'LOTE_PROV'     : resp[0]['1026']['value'][0],
                'PROVEEDOR'     : resp[0]['1021']['value'],
                'ALMACEN'       : "",
                'NO_HUERTA'     : resp[0]['1031']['value'],
                'NOM_HUERTA'    : resp[0]['1032']['value'],
                'AGRICULTOR'    : resp[0]['1014']['value'][0],
                'TIPO_FRUTA'    : resp[0]['1034']['value'][0],
            }]
        };

        const client = new Client(abapSystem);
        client.connect( async (result:any, err:any) => {
            client.invoke("Z_RFC_VA_ENTRADAAGRANEL", IT_DATA, async (err:any, result:any) => {
                err ? res.json(err) : null;
                
                String(result['E_ORDEN_COMPRA']).length > 0 ? postBanderaTCI(res, result, record) : res.json(result['IT_MESSAGE_WARNING']);
            });
        });
    });
});

function postBanderaTCI(res:Response, result:any, record:any){
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to"  : "bqdcp8ghy",
        "data": [{
            "1038"   : { "value":  true },
            "3"      : { "value":  record },
            "1060"   : { "value":  result.E_ORDEN_COMPRA }
        }]
    };
    
    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'metadata')
    ).subscribe(resp => res.json({ resp, result }), err => res.json(err.response) );
}

export default agranel;