import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";
import { Venta } from "../interfaces/interfaces";

const venta = Router();

venta.get('/venta/:fecha', (req:Request, res:Response) => {
    const url = 'https://api.quickbase.com/v1/records';
    let fecha = req.params.fecha;
    const args = {
        I_FECHA  : fecha
    };
    const client = new Client(abapSystem);
    let   arregloM:any[] = [];

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        client.invoke('Z_RFC_PICKINGSELLFRESH', args, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let ventas:Venta[]  = await result["IT_VENTA"];

            ventas.forEach(async (value) => {
                let anio = value.AUDAT.substring(0,4);
                let mes = value.AUDAT.substring(4,6);
                let dia = value.AUDAT.substring(6,8);
                arregloM.push({
                    "6":  { "value": value.VBELN },
                    "7":  { "value": anio+"-"+mes+"-"+dia },
                    "8":  { "value": value.VBTYP },
                    "9":  { "value": value.AUART },
                    "10": { "value": value.VTWEG },
                    "11": { "value": value.SPART }
                });
            });

            const argsVentas = {
                "to"  : "bqzqzavaz",
                "data": arregloM
            };

            // res.json(argsVentas);

            ajax({ createXHR, url, method: 'POST', headers, body: argsVentas }).pipe(
                timeout(60000),
                retry(5),
                pluck('response', 'metadata')
            ).subscribe(resp => res.json( { registros_creados : resp} ), err => res.json(err.response) );
        });
    }); 

});

export default venta;