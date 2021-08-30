import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
const flete = Router();

flete.get('/flete/:record', (req:Request, res:Response) => {
    const record = req.params.record;
    const body = {
        "from": "bqdcp8ghy",
        "select": [ 1046, 1029, 3, 1043, 1051, 1091, 1092 ],
        "where": `{3.EX.${record}}`
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    ).subscribe(resp => {
        
        const IT_DATA = {
            'I_PROVEEDOR'   : resp[0]['1046']['value'],
            'I_FECHA_CORTE' : resp[0]['1029']['value'],
            'I_TEST'        : "",
            'I_CENTRO'      : resp[0]['1091']['value'],
            'I_EKORG'       : resp[0]['1092']['value'],
            'I_IDCORTE'     : String(resp[0]['3']['value']),
            'IT_DATA': [{
                'SERVICIO'      : resp[0]['1043']['value'],
                'CANTIDAD'      : "1",
                'PROVEEDOR'     : resp[0]['1046']['value'],
                'UMEDIDA'       : "SER",
                'IMPORTE'       : resp[0]['1051']['value'],
                'GPO_ARTICULO'  : "",
                'CENTRO'        : "1100"
            }]
        };
       // res.json(IT_DATA);

        const client = new Client(abapSystem);
        client.connect( async (result:any, err:any) => {
            client.invoke("Z_RFC_VA_ENTRADAFLOTILLA", IT_DATA, async (err:any, result:any) => {
                err ? res.json(err) : null;
                //res.json(result);
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
            "1061"   : { "value":  true },
            "3"      : { "value":  record },
            "1072"   : { "value":  result.E_ORDEN_COMPRA },
        }]
    };
    
    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'metadata')
    ).subscribe(resp => res.json(result['IT_MENSAJE_EXITOSOS']), err => res.json(err.response) );
}

export default flete;