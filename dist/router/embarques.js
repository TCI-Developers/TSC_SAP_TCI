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
const embarque = (0, express_1.Router)();
embarque.get('/embarque/:fecha/:type', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records';
    let fecha = req.params.fecha;
    const type = req.params.type;
    const args = {
        I_FECHA: fecha
    };
    let table = '';
    let client = null;
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Embarques_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Embarques_test)) : null;
    let arregloM = [];
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        client.invoke('Z_RFC_PICKINGSELLFRESH', args, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let embarques = yield result["IT_EMBARQUEVTA"];
            embarques.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                arregloM.push({
                    "74": { "value": value.VBELN },
                    "75": { "value": value.VBELV },
                    // "76":  { "value": value.POSNV },
                    // "77":  { "value": value.POSNN },
                    // "78": { "value": value.VBTYP_N },
                    // "79": { "value": value.RFMNG },
                    // "80": { "value": value.MEINS }
                });
            }));
            const argsVentas = {
                "to": table,
                "data": arregloM
            };
            // res.json(argsVentas);
            (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsVentas }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'metadata')).subscribe(resp => res.render(`${pathViews}/proveedores.hbs`, { tipo: 'Embarques', registros_creados: resp }), (err) => res.json(err));
            //subscribe(resp => res.json( { registros_creados : resp} ), err => res.json(err.response) );
        }));
    }));
});
exports.default = embarque;
