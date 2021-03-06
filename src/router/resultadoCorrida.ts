import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const resultadoCorrida = Router();

resultadoCorrida.get('/resultadoCorrida/:ordenCompraAgranel', (req:Request, res:Response) => {

    const ordenCompra:string = req.params.ordenCompraAgranel;
    let   arregloResult:any[] = [];

    const client = new Client(abapSystem);

    client.connect( async (result:any, err:any) => {
        await err ? res.json({ ok:false, message: err}) : null;

        const args = { 
            I_ORDENCOMPRA  : ordenCompra
        };

        client.invoke('Z_RFC_RESULTOC_RDM', args , async (err:any, result:any) => {

            await err ? res.json({ ok: false, message: err }) : null;

            let resultadosCrotes:any[] = await result['IT_RESULTOC'];

            resultadosCrotes.forEach(it => {

                let anio = it.BUDAT.substring(0,4);
                let mes  = it.BUDAT.substring(4,6);
                let dia  = it.BUDAT.substring(6,8);

                arregloResult.push({
                    "6"     : { "value":  it.EBELN },
                    "7"     : { "value":  it.EBELP },
                    "11"    : { "value":  it.MATNR },
                    "8"     : { "value":  it.MENGE },
                    "9"     : { "value":  it.MEINS },
                    "12"    : { "value":  it.CHARG },
                    "13"    : { "value":  dia+"-"+mes+"-"+anio },
                    "14"    : { "value":  it.EBELN+"-"+it.EBELP }
                });
            });

            postResultado(res, arregloResult);
        });
    }); 
});

function postResultado(res:Response, result:any[]) {
    const url = 'https://api.quickbase.com/v1/records';

    const argSResultCorte = {
        "to"  : "brhh5xmxa",
        "data": result
    };

    ajax({ createXHR, url, method: 'POST', headers, body: argSResultCorte }).pipe(
        timeout(60000),
        retry(5),
        //pluck('response', 'metadata')
    ).subscribe(resp => res.json({SAP: result, TCI: resp.response.metadata}) ); 
}

export default resultadoCorrida;