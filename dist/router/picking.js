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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const path_1 = __importDefault(require("path"));
const pathViews = path_1.default.resolve(__dirname, '../views');
const picking = (0, express_1.Router)();
picking.get('/picking/:fecha/:idEmbarque/:type', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records';
    let fecha = req.params.fecha;
    let idEmbarque = req.params.idEmbarque;
    const args = {
        I_FECHA: fecha
    };
    let table = '';
    const type = req.params.type;
    let client = null;
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Picking_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Picking_test)) : null;
    let arregloM = [];
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        client.invoke('Z_RFC_PICKINGSELLFRESH', args, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let embarques = yield result["IT_PICKING"];
            //res.json({ embarques });
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
                "to": table,
                "data": arregloM
            };
            // res.json(argsVentas);
            // res.json({ arregloM });
            (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsVentas }).pipe((0, operators_1.timeout)(20000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'metadata')).subscribe(resp => res.render(`${pathViews}/proveedores.hbs`, { tipo: 'Picking', creados_modificados: resp }), err => res.json(err.response));
            // res.json( { registros_creados : resp } )
        }));
    }));
});
exports.default = picking;
