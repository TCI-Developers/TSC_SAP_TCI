import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
const flete = Router();

flete.get('/flete/:record/:type', (req:Request, res:Response) => {
    const record = req.params.record;
    const type = req.params.type;
    let table:string = '';
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Detalle_Acuerdo_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Detalle_Acuerdo_test)) : null;
    const body = {
        "from": table,
        "select": [ 1046, 1029, 3, 1043, 1051, 1091, 1092, 1095, 1096 ],
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
            'I_ESCONTRATO'  : resp['1095']['value'],
            'IT_DATA': [{
                'SERVICIO'      : resp[0]['1043']['value'],
                'CANTIDAD'      : "1",
                'PROVEEDOR'     : resp[0]['1046']['value'],
                'UMEDIDA'       : "SER",
                'IMPORTE'       : resp[0]['1051']['value'],
                'GPO_ARTICULO'  : "",
                'CENTRO'        : "1100",
                'AUFNR'         : resp['1096']['value'],
            }]
        };
       // res.json(IT_DATA);

        client.connect( async (result:any, err:any) => {
            client.invoke("Z_RFC_VA_ENTRADAFLOTILLA", IT_DATA, async (err:any, result:any) => {
                err ? res.json(err) : null;
                //res.json(result);
                String(result['E_ORDEN_COMPRA']).length > 0 ? postBanderaTCI(res, result, record, table) : res.json(result['IT_MESSAGE_WARNING']);
            });
        });
    });
});


function postBanderaTCI(res:Response, result:any, record:any, table:string){
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to"  : table,
        "data": [{
            "1061"   : { "value":  true },
            "3"      : { "value":  record },
            "1072"   : { "value":  result.E_ORDEN_COMPRA },
            "1051"   : { "value":  result.E_IMPORTE },
        }]
    };
    
    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'metadata')
    ).subscribe(resp => res.json(result['IT_MENSAJE_EXITOSOS']), err => res.json(err.response) );
}

export default flete;