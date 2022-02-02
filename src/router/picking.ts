import { Router, Request, Response } from "express";
import { ajax } from 'rxjs/ajax';
import { pluck, timeout, retry } from 'rxjs/operators';
import { headers, createXHR, Tables } from "../utils/utils";
import { Client } from "node-rfc";
import { abapSystem, abapSystemTest } from "../sap/sap";
import { detallesEmbarque } from "../interfaces/interfaces";

const picking = Router();

picking.get('/picking/:fecha/:idEmbarque/:type', (req:Request, res:Response) => {

    const url       = 'https://api.quickbase.com/v1/records';
    let fecha       = req.params.fecha;
    let idEmbarque  = req.params.idEmbarque;

    const args = {
        I_FECHA  : fecha
    };
    let table:string = '';
    const type = req.params.type;
    let client:any = null;
    type == 'prod' ? 
    (client = new Client(abapSystem), table = String(Tables.T_Picking_prod)) : 
    type == 'test' ? 
   ( client = new Client(abapSystemTest), table = String(Tables.T_Picking_test)) : null;
    let   arregloM:any[] = [];

    client.connect( async (result:any, err:any) => {

        await err ? res.json({ ok:false, message: err}) : null;

        client.invoke('Z_RFC_PICKINGSELLFRESH', args, async (err:any, result:any) => {        
        
            await err ? res.json({ ok: false, message: err }) : null;

            let embarques:detallesEmbarque[]  = await result["IT_PICKING"];

            embarques = embarques.filter(val => val.EMBARQUE === idEmbarque);

            embarques.forEach(async (value) => {

                let anio = value.FEC_EMB.substring(0,4);
                let mes  = value.FEC_EMB.substring(4,6);
                let dia  = value.FEC_EMB.substring(6,8);

                arregloM.push({
                    "20": { "value": value.DET_VTA },
                    "19": { "value": value.DET_EMB },
                    "6" : { "value": value.CANT_EMB },
                    "7":  { "value": value.UM_EMB },
                    "8":  { "value": anio+"-"+mes+"-"+dia},
                    "9":  { "value": value.UID_PALLET },
                    "10": { "value": value.ID_PALLET },
                    "11": { "value": value.ID_CAJA },
                    "12": { "value": value.CANT_HU },
                    "13": { "value": value.UM_STOCK },
                    "14": { "value": value.LOTE },
                    "15": { "value": value.STATUS_EMB },
                    "16": { "value": value.STATUS_FAC },
                    "17": { "value": value.MARCA },
                    "22": { "value": value.PRESENTACION },
                    "21": { "value": value.EMBARQUE+"-"+value.DET_EMB },
                    "23": { "value": value.MATERIAL },
                });
            });

            const argsVentas = {
                "to"  : table,
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

export default picking;