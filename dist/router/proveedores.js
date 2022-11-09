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
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const path_1 = __importDefault(require("path"));
const proveedor = (0, express_1.Router)();
const pathViews = path_1.default.resolve(__dirname, '../views');
proveedor.get('/proveedores/:id/:type', (req, res) => {
    const id = req.params.id;
    const type = req.params.type;
    let table1 = '';
    let table2 = '';
    let table3 = '';
    let client = null;
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem),
            table1 = String(utils_1.Tables.T_Productor_prod),
            table2 = String(utils_1.Tables.T_Cuadrillas_prod),
            table3 = String(utils_1.Tables.T_Transportes_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest),
                table1 = String(utils_1.Tables.T_Productor_test),
                table2 = String(utils_1.Tables.T_Cuadrillas_test),
                table3 = String(utils_1.Tables.T_Transportes_test)) : null;
    let arregloM = [];
    let arregloC = [];
    let arregloT = [];
    const url = 'https://api.quickbase.com/v1/records';
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        //client.invoke("Z_RFC_ENTRY_VA_FRESH", { 'IT_POSTING_BOX': [body] }, async (err:any, result:any) => {
        client.invoke('Z_RFC_TBL_CATALOG_PRO', {}, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            //return res.json(result);
            let proveedores = yield result["IT_PROVEEDORES"];
            proveedores.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
                if (value.J_1KFTIND == "Cuadrillas y fletes") {
                    //cuadrillas
                    arregloC.push({
                        "176": { "value": value.LIFNR },
                        "177": { "value": value.LAND1 },
                        "7": { "value": value.NAME1 },
                        //"72": { "value": value.NAME2 },
                        "178": { "value": value.ORT01 },
                        "179": { "value": value.EKORG },
                        "180": { "value": value.ZTERM },
                        "181": { "value": value.J_1KFTIND },
                        "182": { "value": value.TEXT },
                    });
                    //Fletes                   
                    arregloT.push({
                        "16": { "value": value.LIFNR },
                        "17": { "value": value.LAND1 },
                        "11": { "value": value.NAME1 },
                        "18": { "value": value.ORT01 },
                        "19": { "value": value.EKORG },
                        "20": { "value": value.ZTERM },
                        "21": { "value": value.J_1KFTIND },
                        "22": { "value": value.TEXT },
                    });
                }
                else if (value.KALSK == "Z4") {
                    arregloM.push({
                        "71": { "value": value.LIFNR },
                        "73": { "value": value.LAND1 },
                        "6": { "value": value.NAME1 },
                        "72": { "value": value.NAME2 },
                        "26": { "value": value.ORT01 },
                        "74": { "value": value.EKORG },
                        "75": { "value": value.ZTERM },
                        "76": { "value": value.KALSK },
                    });
                }
                else if (value.J_1KFTIND == "Cuadrillas") {
                    arregloC.push({
                        "176": { "value": value.LIFNR },
                        "177": { "value": value.LAND1 },
                        "7": { "value": value.NAME1 },
                        //"72": { "value": value.NAME2 },
                        "178": { "value": value.ORT01 },
                        "179": { "value": value.EKORG },
                        "180": { "value": value.ZTERM },
                        "181": { "value": value.J_1KFTIND },
                        "182": { "value": value.TEXT },
                    });
                }
                else if (value.J_1KFTIND == "Fletes") {
                    arregloT.push({
                        "16": { "value": value.LIFNR },
                        "17": { "value": value.LAND1 },
                        "11": { "value": value.NAME1 },
                        "18": { "value": value.ORT01 },
                        "19": { "value": value.EKORG },
                        "20": { "value": value.ZTERM },
                        "21": { "value": value.J_1KFTIND },
                        "22": { "value": value.TEXT },
                    });
                }
            }));
            const argsFacturadores = {
                "to": table1,
                "data": arregloM
            };
            const argsCuadrilla = {
                "to": table2,
                "data": arregloC
            };
            const argsTransporte = {
                "to": table3,
                "data": arregloT
            };
            //  res.json(proveedores);
            const obs1$ = (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsFacturadores }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(5), (0, operators_1.pluck)('response', 'data')
            // pluck('response', 'metadata', 'unchangedRecordIds')
            );
            const obs2$ = (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsCuadrilla }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(5), (0, operators_1.pluck)('response', 'metadata', 'unchangedRecordIds'));
            const obs3$ = (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsTransporte }).pipe((0, operators_1.timeout)(60000), (0, operators_1.retry)(5), (0, operators_1.pluck)('response'));
            if (id == "1") {
                // res.render('../views/list-users.hbs',{ usuariosResponse });
                // const provedorFruta =[{tipo: 'Proveedores de Fruta', creados_modificados: resp }];
                obs1$.subscribe(resp => res.render(`${pathViews}/proveedores.hbs`, { tipo: 'Proveedores de Fruta', creados_modificados: resp }), err => res.json(err.response));
                // obs1$.subscribe(resp => res.json({ tipo:'Proveedor de Fruta', creados_modificados: resp }), err => res.json(err.response) );
            }
            else if (id == "2") {
                obs2$.subscribe(resp => res.render(`${pathViews}/proveedores.hbs`, { tipo: 'Proveedores de Cuadrillas', creados_modificados: resp }), err => res.json(err.response));
                //obs2$.subscribe(resp => res.json({ creados_modificados: resp }), err => res.json(err.response) );
            }
            else if (id == "3") {
                obs3$.subscribe(resp => res.render(`${pathViews}/proveedores.hbs`, { tipo: 'Proveedores de Fletes', creados_modificados: resp }), err => res.json(err.response));
                // obs3$.subscribe(resp => res.json({ creados_modificados: resp }), err => res.json(err.response) );
            }
            else if (id == "4") {
                obs2$.subscribe(resp => res.render(`${pathViews}/proveedores.hbs`, { tipo: 'Proveedores de Cuadrillas y Fletes', creados_modificados: resp }), err => res.json(err.response));
                obs3$.subscribe(resp => res.render(`${pathViews}/proveedores.hbs`, { tipo: 'Proveedores de Fletes y Cuadrillas', creados_modificados: resp }), err => res.json(err.response));
            }
        }));
    }));
});
exports.default = proveedor;
