import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import path from "path";


const pathViews = path.resolve(__dirname,'../views');
const flotilla = Router();

flotilla.get('/flotilla/:record/:proveedores/:type', (req:Request, res:Response) => {
    const record        = req.params.record;
    const proveedores   = req.params.proveedores.split("-");
    const type = req.params.type;
    let table:string = '';
    const status = 'Autorizada';
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Detalle_Corte_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Detalle_Corte_test)) : null;
    for (const item of proveedores) {
        
    const body = {
        "from": table,
        "select": [ 651, 658, 14, 654, 644, 3, 699, 700 ],
        "where": `{14.EX.${record}}AND{651.EX.${item}}AND{676.EX.''}AND{182.EX.''}AND{703.EX.${status}}`
    }

    const url = 'https://api.quickbase.com/v1/records/query';

    ajax({ createXHR, url, method: 'POST', headers, body }).pipe(
        timeout(10000),
        retry(1),
        pluck('response', 'data')
    ).subscribe((resp:any[]) => {

        //res.json(resp);

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
                'I_CENTRO'      : item['699']['value'],
                'I_EKORG'       : item['700']['value'],
                'IT_DATA': [{
                    'SERVICIO'      : item['654']['value'],
                    'CANTIDAD'      : "1.00",
                    'PROVEEDOR'     : item['651']['value'],
                    'UMEDIDA'       : "SER",
                    'IMPORTE'       : importe += item['644']['value'],
                    'GPO_ARTICULO'  : "",
                    'CENTRO'        : "1100",
                }]
            };
        }

             
             //   res.json(IT_DATA);

        client.connect( async (result:any, err:any) => {
            client.invoke("Z_RFC_VA_ENTRADAFLOTILLA", IT_DATA , async (err:any, result:any) => {

                err ? res.json(err) : null;
                
                String(result['E_ORDEN_COMPRA']).length > 0 ? ( postBanderaTCI(res, result, ids, table) ) : res.render(`${pathViews}/flotillas.hbs` ,{ tipo: 'WARNING', respuesta : result['IT_MESSAGE_WARNING'] }); //res.json(result['IT_MESSAGE_WARNING']);
                
            });
        });
    });
    }
});

function postBanderaTCI(res:Response, result:any, ids:any[], table:string) {
    const url = 'https://api.quickbase.com/v1/records';

    for (const iterator of ids) {

        const args = {
            "to"  : table,
            "data": [{
                "3"  : { "value":  iterator },
                "676" : { "value":  result.E_ORDEN_COMPRA }
            }]
        };
        ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        //ajax({ url, method: 'POST', body: args }).pipe(
            timeout(10000),
            retry(1),
            pluck('response', 'metadata')
        ).subscribe(resp => res.render(`${pathViews}/flotillas.hbs` ,{ tipo: 'EXITO', respuesta: result['IT_MENSAJE_EXITOSOS'] }), err => res.json(err.response) );
        //['IT_MENSAJE_EXITOSOS']
        //res.render(`${pathViews}/proveedores.hbs` ,{ tipo:'Ventas', creados_modificados: resp })
        // res.json(result['IT_MENSAJE_EXITOSOS'])
    }
    
}

export default flotilla;