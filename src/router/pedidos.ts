import { Router, Request, Response } from "express";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const pedidos = Router();

pedidos.get('/pedidos/:fecha', (req:Request, res:Response) => {

    const fecha:string = req.params.fecha;

    const client = new Client(abapSystem);

    client.connect( async (result:any, err:any) => {
        await err ? res.json({ ok:false, message: err}) : null;

        const args = {
            I_FECHA  : fecha
        };

        client.invoke('Z_RFC_PICKINGSELLFRESH', args , async (err:any, result:any) => {

            await err ? res.json({ ok: false, message: err }) : null;

            res.json(result);
        });
    }); 
});

export default pedidos;