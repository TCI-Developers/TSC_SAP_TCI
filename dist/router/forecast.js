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
const node_rfc_1 = require("node-rfc");
const sap_1 = require("../sap/sap");
const utils_1 = require("../utils/utils");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const path_1 = __importDefault(require("path"));
const pathViews = path_1.default.resolve(__dirname, '../views');
const forecast = (0, express_1.Router)();
forecast.get('/forecast/:type', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records';
    const type = req.params.type;
    let table = '';
    let client = null;
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Forecast_SAP_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Forecast_SAP_test)) : null;
    let arregloM = [];
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        client.invoke('Z_RFC_TBL_CATALOG_FORE_REQ', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let forecastResult = yield result["IT_FORECAST"];
            forecastResult.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                let anio = value.DAT00.substring(0, 4);
                let mes = value.DAT00.substring(4, 6);
                let dia = value.DAT00.substring(6, 8);
                //FECHA DOS
                let anioUMDAT = value.UMDAT.substring(0, 4);
                let mesUMDAT = value.UMDAT.substring(4, 6);
                let diaUMDAT = value.UMDAT.substring(6, 8);
                arregloM.push({
                    "6": { "value": value.MATNR },
                    "25": { "value": value.MAKTX },
                    "8": { "value": value.MENGE },
                    "26": { "value": value.MEINS },
                    "10": { "value": value.VBELN },
                    "11": { "value": value.POSNR },
                    "12": { "value": value.PLNUM },
                    "13": { "value": anio + "-" + mes + "-" + dia },
                    "27": { "value": value.EXTRA },
                    "28": { "value": value.DELB0 },
                    "29": { "value": value.KUNNR },
                    "30": { "value": value.MD4KD },
                    "32": { "value": anioUMDAT + "-" + mesUMDAT + "-" + diaUMDAT },
                });
            }));
            const argsForescast = {
                "to": table,
                "data": arregloM
            };
            //res.json( arregloM[0] );
            const obs$ = (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsForescast }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'metadata'));
            obs$.subscribe((respuesta) => res.json({ creados_modificados: respuesta }), (err) => res.json(err));
            //obs$.subscribe(resp =>  res.render(`${pathViews}/proveedores.hbs` ,{ tipo:'Forecast', creados_modificados: resp }), err => res.json(err.response) );
        }));
    }));
});
exports.default = forecast;
