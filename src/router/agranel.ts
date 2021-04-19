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
        "from": "bqhds58u2",
        "select": [ 54, 53, 52, 51, 32, 15, 6, 8, 24, 55, 3, 58, 59 ],
        "where": `{15.EX.${record}}`
    }
    const url = 'https://api.quickbase.com/v1/records/query';

    ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    ).subscribe((resp:any[]) => {

        for (const iterator of resp) {
        let recordHuerta =  iterator['3']['value'];

        let IT_DATA = {
            'I_FECHA_CORTE' : iterator['54']['value'],
            'I_FACTURADOR'  : iterator['53']['value'] || "",
            'I_PROVEEDOR'   : iterator['52']['value'],
            'I_IDCORTE'     : String(iterator['51']['value']),
                'IT_DATA': [{
                'MATERIAL'      : "000000006000000030",
                'CANTIDAD'      : Number(iterator['32']['value']).toFixed(2),
                'LOTE_PROV'     : String(iterator['15']['value']) || "",
                'PROVEEDOR'     : iterator['52']['value'],
                'ALMACEN'       : "",
                'NO_HUERTA'     : iterator['6']['value'],
                'NOM_HUERTA'    : iterator['8']['value'],
                'AGRICULTOR'    : iterator['24']['value'],
                'TIPO_FRUTA'    : iterator['55']['value'][0],
                'CORTE_FRUTA'   : iterator['58']['value'],
                'TIPO_CORTE'    : iterator['59']['value']
            }]
        };

        //res.json(IT_DATA);

            const client = new Client(abapSystem);
            client.connect( (result:any, err:any) => {
                client.invoke("Z_RFC_VA_ENTRADAAGRANEL", IT_DATA, async (err:any, result:any) => {
                    err ? res.json(err) : null;
                    String(result['E_ORDEN_COMPRA']).length > 0 ?  postOrdenCompraTCI(res, result, recordHuerta ) : res.json(result);
                });
            });
        }
    });
});

function postBanderaTCI(res:Response, result:any, record:any) {
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to"  : "bqdcp8ghy",
        "data": [{
            "1038"   : { "value":  true },
            "3"      : { "value":  record }
        }]
    };
    
    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'metadata')
    ).subscribe(resp => res.json({SAP: result['IT_MENSAJE_EXITOSOS'], TCI: resp}), err => res.json(err.response) );
}

function postOrdenCompraTCI(res:Response, result:any, record:any) {
    const url = 'https://api.quickbase.com/v1/records';
    const lote = result.IT_MENSAJE_EXITOSOS[3].MESSAGE.split(" ");
       
    const args = {
        "to"  : "bqhds58u2",
        "data": [{
            "3"  : { "value":  record },
            "35" : { "value":  result.E_ORDEN_COMPRA },
            "61" : { "value":  lote[2] }
        }]
    };
    
    //res.json({SAP: result, TCI: resp.response.metadata})

    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        //pluck('response', 'metadata')
    ).subscribe(resp => postLoteSAP(res, lote[2], record, result), err => res.json(err.response) ); 
}

const postLoteSAP = async (res:Response, lote:any, record:any, result:any) => {
    const url = 'https://api.quickbase.com/v1/records';
       
    const args = {
        "to"  : "lote",
        "data": [{
            "6"  : { "value":  record },
            "7"  : { "value":  lote }
        }]
    };
    
    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        //pluck('response', 'metadata')
    ).subscribe(resp =>  res.json({SAP: result, TCI: resp.response.metadata}), err => res.json(err.response) ); 
}

export default agranel;