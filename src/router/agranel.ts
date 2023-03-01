import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import path from "path";


const pathViews = path.resolve(__dirname,'../views');

const agranel = Router();

agranel.get('/agranel/:record/:type', (req:Request, res:Response) => {
    const record = req.params.record;
    const type   = req.params.type;
    let table:string = '';
    let tableSAP:string = '';
    let tableAcuerdo:string = '';
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem),
     table = String(Tables.T_Detalle_Huerta_prod),
     tableAcuerdo = String(Tables.T_Detalle_Acuerdo_prod),
     tableSAP = String(Tables.T_Lotes_SAP_prod)
     ) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), 
   table = String(Tables.T_Detalle_Huerta_test),
   tableAcuerdo = String(Tables.T_Detalle_Acuerdo_test),
   tableSAP = String(Tables.T_Lotes_SAP_test)
   ) : null;
   
    const body = {
        "from": table,
        "select": [ 54, 53, 52, 51, 32, 15, 6, 8, 24, 55, 3, 58, 59, 68, 69 ],
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
            'CENTRO'        : iterator['68']['value'],
            'ORG_COMPRAS'   : iterator['69']['value'],
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

          
         
         
            client.connect( (result:any, err:any) => {
                client.invoke("Z_RFC_VA_ENTRADAAGRANEL", IT_DATA, async (err:any, result:any) => {
                    err ? res.json(err) : null;
                 
                   String(result['E_ORDEN_COMPRA']).length > 0 ? postOrdenCompraTCI(res, result, recordHuerta, table, tableSAP ) :  res.render(`${pathViews}/flotillas.hbs` ,{ tipo: 'WARNING', respuesta: result['IT_MESSAGE_WARNING'] }); // res.json(result['IT_MESSAGE_WARNING']);
                });
            }); 
        }
    });
});

function postBanderaTCI(res:Response, result:any, record:any, tableAcuerdo:string) {
    const url = 'https://api.quickbase.com/v1/records';
    const args = {
        "to"  : tableAcuerdo,
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

function postOrdenCompraTCI(res:Response, result:any, record:any, table:string, tableSAP:string) {
    const url = 'https://api.quickbase.com/v1/records';
   // var lote: string;
 const lote = result.IT_MENSAJE_EXITOSOS[2].MESSAGE.split(" "); //[2]
  /* if (result['IT_MENSAJE_EXITOSOS'].length > 2) {
        
         lote = result.IT_MENSAJE_EXITOSOS[3].MESSAGE.split(" "); 
         

    }else{
         lote = result.IT_MENSAJE_EXITOSOS[2].MESSAGE.split(" "); 
        
    }*/
    
    //res.json({SAP: lote[2] });

    
       
    const args = {
        "to"  : table,
        "data": [{
            "3"  : { "value":  record },
            "35" : { "value":  result.E_ORDEN_COMPRA },
            "61" : { "value":  lote[5] } //[5]
        }]
    };
    
    

    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        //pluck('response', 'metadata')
    ).subscribe(resp => postLoteSAP(res, lote[2], record, result, tableSAP), err => res.json(err.response) );

}

const postLoteSAP = async (res:Response, lote:any, record:any, result:any, tableSAP:string) => {
    const url = 'https://api.quickbase.com/v1/records';
       
    const args = {
        "to"  : tableSAP,
        "data": [{
            "6"  : { "value":  lote },
            "7"  : { "value":  record }
        }]
    };
    
    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        //pluck('response', 'metadata')
    ).subscribe(resp => res.render(`${pathViews}/flotillas.hbs` ,{ tipo: 'EXITO', respuesta: result['IT_MENSAJE_EXITOSOS'] }), err => res.json(err.response) );
    //subscribe(resp =>  res.json({SAP: result['IT_MENSAJE_EXITOSOS'], TCI: resp.response.metadata }), err => res.json(err.response) );
     
}

//vpn.villaavocado.proatech.mx
//tci01@vpn.villaavocado.proatech.mx
//tci01
//NOqcyzGQ

export default agranel;