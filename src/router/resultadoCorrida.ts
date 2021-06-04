import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const resultadoCorrida = Router();

resultadoCorrida.get('/resultadoCorrida/:ordenCompraAgranel', (req:Request, res:Response) => {

    const ordenCompra:string = req.params.ordenCompraAgranel;

    const client = new Client(abapSystem);

    client.connect( async (result:any, err:any) => {
        await err ? res.json({ ok:false, message: err}) : null;

        const args = {
            I_ORDENCOMPRA  : ordenCompra
        };

        client.invoke('Z_RFC_RESULTOC_RDM', args , async (err:any, result:any) => {

            await err ? res.json({ ok: false, message: err }) : null;

            res.json(result);
        });
    }); 
});

export default resultadoCorrida;