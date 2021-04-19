import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";

const vinculacion = Router();

vinculacion.get('/vinculacion/:idProductor/:nombres', (req:Request, res:Response) => {
        const huertas = req.params.nombres.split(';');
        const record  = req.params.idProductor;

        let huertasF:any[] = [];

        for (const iterator of huertasF) {
            const url = 'https://api.quickbase.com/v1/records';
            const args = {
                "to"  : "bqt3249tp",
                "data": [{
                    "6"      : { "value":  record   },
                    "17"     : { "value":  iterator },
                }]
            };
        
            ajax({ createXHR, url, method: 'POST', headers, body: args }).pipe(
                timeout(60000),
                retry(5),
                pluck('response', 'data')
            ).subscribe(resp => {
                res.json(resp);
            });   
        }
});

export default vinculacion;