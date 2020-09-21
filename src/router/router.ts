import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

let arregloAll:any[] = [];
const router = Router();

router.get('/acuerdo/:fecha', (req:Request, res:Response) => {
    const fecha = req.params.fecha;
    const args1 = {
        "from": "bqdcp8fbc",
        "select": [ 675, 676, 658, 677, 29, 669, 678],
        "where": `{58.EX.${fecha}}AND{489.EX.true}AND{680.EX.false}`
    }
    const args2 = {
        "to"  : "bqdcp8fbc",
        "data": [{
            "680":{
                "value": "true"
            },
            "681":{
                "value": `${fecha}`
            }
        }]
    };

    const obs$ = ajax({
        createXHR,
        url: 'https://api.quickbase.com/v1/records/query',
        method: 'POST',
        headers,
        body: args1
    }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    );
    
    obs$.subscribe((result:any[]) => {
        result.length < 1 ? res.json('No hay acuerdos que mandar') : null;
        
        result.forEach(value => {
            value['677']['value'] === '1' ? postAcuerdo(value, args2, res) : postBandeado(value, res);
        });
    }, 
    errors => {
        res.json(errors);
    });
});

router.get('/acuerdo1/:record', (req:Request, res:Response) => {
    const url = 'https://api.quickbase.com/v1/records/query';
    const record = req.params.record;
    const argsAcuerdos = {
        "from": "bqdcp8fbc",
        "select": [ 675, 676, 658, 677, 29, 669, 678],
        "where": `{3.EX.${record}}AND{489.EX.true}AND{680.EX.false}`
    }
    const argsValidacion = {
        "to"  : "bqdcp8fbc",
        "data": [{
            "680":{
                "value": "true"
            },
            "3":{
                "value": `${record}`
            }
        }]
    };

    const obs$ = ajax({ createXHR, url, method: 'POST', headers, body: argsAcuerdos }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    );
    
    obs$.subscribe((result:any[]) => {
        result.length < 1 ? res.json('No hay acuerdos que mandar') : null;
        
        result.forEach(value => {
            value['677']['value'] === '1' ? postAcuerdo(value, argsValidacion, res) : postBandeado(value, res);
        });
    }, 
    errors => {
        res.json(errors);
    });
});

function postBandeado(value:any, res:Response) {
    let arregloP:any[] = value['678']['value'];
    const url = 'https://api.quickbase.com/v1/records';

    arregloP.forEach((val:string) => {

        let codigoPrecio = val.split("-");
        const argsValidacion = {
            "to"  : "bqr9nfpuk",
            "data": [{
                "16":{
                    "value": "true"
                },
                "3":{
                    "value": `${codigoPrecio[2]}`
                }
            }]
        };

        const args = {
            FECHA           : String(value['675']['value']),
            USUARIO         : String(value['676']['value']['email']),
            PROVEEDOR       : String(value['658']['value']),
            OPERACION       : String(value['677']['value']),
            MATERIAL        : codigoPrecio[0],
            GRUPO_MATERIAL  : "",
            //PRECIO          : String(codigoPrecio[1]+".00").substring(0,5),
            PRECIO          : codigoPrecio[1],
            MONEDA          : String(value['669']['value']),
            CORTE           : "",
            ORDEN_COMPRA    : ""
        };

        //res.json(args);

        args.FECHA     == ""  ? res.json('No se mando Fecha') : 
        args.USUARIO   == ""  ? res.json('No se mando Usuario') :
        args.PROVEEDOR == ""  ? res.json('No se mando Proveedor') :
        args.OPERACION == ""  ? res.json('No se mando Operacion') :
        args.PRECIO    == ""  ? res.json('No se mando Precio') :
        args.MONEDA    == ""  ? res.json('No se mando Moneda') : null;
        
        const client = new Client(abapSystem);
        client.connect( (resul:any, er:any) => {

        er ? res.json({ ok:false, message: er}) : null;

        client.invoke('Z_RFC_VA_PRECIOACUERDO', args, async (error:any, resultado:any) => {
            error ? res.json({ ok: false, message: error }) : null;

            const obs$ = ajax({ createXHR, url, method: 'POST', headers, body: argsValidacion }).pipe(
                timeout(60000),
                retry(5),
                pluck('response', 'metadata')
            );

            String(resultado['MENSAJE']).substring(0,3) === '200' ? obs$.subscribe(respuesta => res.json({ respuesta, resultado }), err => res.json(err)) :
            String(resultado['MENSAJE']).substring(0,3) === '201' ? obs$.subscribe(respuesta => res.json({ respuesta, resultado }), err => res.json(err)) :
            String(resultado['MENSAJE']).substring(0,3) === '202' ? obs$.subscribe(respuesta => res.json({ respuesta, resultado }), err => res.json(err)) : res.json(resultado);
            });
        });
    });
}

function postAcuerdo(value:any, args2:any, res:Response){
    let valor = String(value['29']['value']).split('.');
    let precio = valor[0]+'.'+valor[1]+0;
    valor.length > 1 ? precio : precio = valor[0];

    const args = {
        FECHA           : String(value['675']['value']),
        USUARIO         : String(value['676']['value']['email']),
        PROVEEDOR       : String(value['658']['value']),
        OPERACION       : String(value['677']['value']),
        MATERIAL        : "",
        GRUPO_MATERIAL  : "001",
        PRECIO          : String(precio).substring(0,5),
        MONEDA          : String(value['669']['value']),
        CORTE           : "",
        ORDEN_COMPRA    : ""
    };

    args.FECHA     == ""  ? res.json('No se mando Fecha') : 
    args.USUARIO   == ""  ? res.json('No se mando Usuario') :
    args.PROVEEDOR == ""  ? res.json('No se mando Proveedor') :
    args.OPERACION == ""  ? res.json('No se mando Operacion') :
    args.PRECIO    == ""  ? res.json('No se mando Precio') :
    args.MONEDA    == ""  ? res.json('No se mando Moneda') : null;

    const client = new Client(abapSystem);
    client.connect( (resul:any, er:any) => {

    er ? res.json({ ok:false, message: er}) : null;

    client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (error:any, resultado:any) => {
        error ? res.json({ ok: false, message: error }) : null;

        const obs$ = ajax({
            createXHR,
            url: 'https://api.quickbase.com/v1/records',
            method: 'POST',
            headers,
            body: args2
        }).pipe(
            timeout(60000),
            retry(5),
            pluck('response', 'metadata')
        );

          String(resultado['MENSAJE']).substring(0,3) === '100' ? obs$.subscribe(resp => res.json({ resp, resultado }), err => res.json(err)) : 
          String(resultado['MENSAJE']).substring(0,3) === '101' ? obs$.subscribe(resp => res.json({ resp, resultado }), err => res.json(err)) : res.json( resultado );
        });
    });
}

export default router;