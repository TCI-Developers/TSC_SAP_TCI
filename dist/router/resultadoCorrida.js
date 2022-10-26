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
const pathViews = path_1.default.resolve(__dirname, '../views');
const resultadoCorrida = express_1.Router();
resultadoCorrida.get('/resultadoCorrida/:ordenCompraAgranel/:type', (req, res) => {
    const ordenCompra = req.params.ordenCompraAgranel;
    let arregloResult = [];
    const type = req.params.type;
    let client = null;
    let table = '';
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem), table = String(utils_1.Tables.T_Resultado_Corrida_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest), table = String(utils_1.Tables.T_Resultado_Corrida_test)) : null;
    client.connect((result, err) => __awaiter(void 0, void 0, void 0, function* () {
        (yield err) ? res.json({ ok: false, message: err }) : null;
        const args = {
            I_ORDENCOMPRA: ordenCompra
        };
        client.invoke('Z_RFC_RESULTOC_RDM', args, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            (yield err) ? res.json({ ok: false, message: err }) : null;
            let resultadosCrotes = yield result['IT_RESULTOC'];
            resultadosCrotes.forEach(it => {
                let anio = it.BUDAT.substring(0, 4);
                let mes = it.BUDAT.substring(4, 6);
                let dia = it.BUDAT.substring(6, 8);
                arregloResult.push({
                    "6": { "value": it.EBELN },
                    "7": { "value": it.EBELP },
                    "11": { "value": it.MATNR },
                    "8": { "value": it.MENGE },
                    "9": { "value": it.MEINS },
                    "12": { "value": it.CHARG },
                    "15": { "value": dia + "-" + mes + "-" + anio },
                    "14": { "value": it.EBELN + "-" + it.EBELP }
                });
            });
            postResultado(res, arregloResult, table);
        }));
    }));
});
function postResultado(res, result, table) {
    const url = 'https://api.quickbase.com/v1/records';
    const argSResultCorte = {
        "to": table,
        "data": result
    };
    ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argSResultCorte }).pipe(operators_1.timeout(60000), operators_1.retry(5)).subscribe(resp => res.json({ SAP: result, TCI: resp.response.metadata }));
}
exports.default = resultadoCorrida;
