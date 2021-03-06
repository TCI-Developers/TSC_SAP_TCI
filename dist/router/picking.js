"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const picking = express_1.Router();
picking.get('/picking/:fecha/:idEmbarque', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records';
    let fecha = req.params.fecha;
    let idEmbarque = req.params.idEmbarque;
    const args = {
        I_FECHA: fecha
    };
    const client = new node_rfc_1.Client(sap_1.abapSystem);
    let arregloM = [];
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        client.invoke('Z_RFC_PICKINGSELLFRESH', args, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let embarques = yield result["IT_PICKING"];
            embarques = embarques.filter(val => val.EMBARQUE === idEmbarque);
            embarques.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                let anio = value.FEC_EMB.substring(0, 4);
                let mes = value.FEC_EMB.substring(4, 6);
                let dia = value.FEC_EMB.substring(6, 8);
                arregloM.push({
                    "20": { "value": value.DET_VTA },
                    "19": { "value": value.DET_EMB },
                    "6": { "value": value.CANT_EMB },
                    "7": { "value": value.UM_EMB },
                    "8": { "value": anio + "-" + mes + "-" + dia },
                    "9": { "value": value.UID_PALLET },
                    "10": { "value": value.ID_PALLET },
                    "11": { "value": value.ID_CAJA },
                    "12": { "value": value.CANT_HU },
                    "13": { "value": value.UM_STOCK },
                    "14": { "value": value.LOTE },
                    "15": { "value": value.STATUS_EMB },
                    "16": { "value": value.STATUS_FAC },
                    "17": { "value": value.MARCA },
                    "22": { "value": value.PRESENTACION },
                    "21": { "value": value.EMBARQUE + "-" + value.DET_EMB },
                    "23": { "value": value.MATERIAL },
                });
            }));
            const argsVentas = {
                "to": "bq2942w6n",
                "data": arregloM
            };
            // res.json(argsVentas);
            ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsVentas }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata')).subscribe(resp => res.json({ registros_creados: resp }), err => res.json(err.response));
        }));
    }));
});
exports.default = picking;
