import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import path from "path";


const pathViews = path.resolve(__dirname,'../views');
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

    //res.json({msg: body });

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
            'I_ESCONTRATO'  : resp[0]['1095']['value'],
            'IT_DATA': [{
                'SERVICIO'      : resp[0]['1043']['value'],
                'CANTIDAD'      : "1",
                'PROVEEDOR'     : resp[0]['1046']['value'],
                'UMEDIDA'       : "SER",
                'IMPORTE'       : resp[0]['1051']['value'],
                'GPO_ARTICULO'  : "",
                'CENTRO'        : "1100",
                'AUFNR'         : resp[0]['1096']['value'],
            }]
        };
        //res.json(IT_DATA.I_ESCONTRATO);

        client.connect( async (result:any, err:any) => {
            client.invoke("Z_RFC_VA_ENTRADAFLETE", IT_DATA, async (err:any, result:any) => {
                err ? res.json(err) : null;
                //res.json(result);
                String(result['E_ORDEN_COMPRA']).length > 0 ? postBanderaTCI(res, result, record, table, IT_DATA.I_ESCONTRATO) : res.render(`${pathViews}/flotillas.hbs` ,{ tipo: 'WARNING', respuesta : result['IT_MESSAGE_WARNING'] });
            
            });
        }); 
    });
});


function postBanderaTCI(res:Response, result:any, record:any, table:string, tipo:string){
    const url = 'https://api.quickbase.com/v1/records';
    let importe:string = '';

    
     tipo == "X" ? importe = result.E_IMPORTE : importe = result['IT_DATA'][0].IMPORTE;
    // res.json(  { ORDEN_COMPRA : result });
    

    
    const args = {
        "to"  : table,
        "data": [{
            "1061"   : { "value":  true },
            "3"      : { "value":  record },
            "1072"   : { "value":  result.E_ORDEN_COMPRA },
            "1051"   : { "value":  importe },
        }]
    };
    
    ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'metadata')
    ).subscribe(resp => res.render(`${pathViews}/flotillas.hbs` ,{ tipo: 'EXITO', respuesta: result['IT_MENSAJE_EXITOSOS'] }), err => res.json(err.response) );
    //resp => res.render(`${pathViews}/flotillas.hbs` ,{ tipo: 'EXITO', respuesta: result['IT_MENSAJE_EXITOSOS'] }

    
}

export default flete;