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
let arregloAll = [];
const router = express_1.Router();
/*router.get('/acuerdo/:fecha', (req:Request, res:Response) => {
    const fecha = req.params.fecha;
    const args1 = {
        "from": String(Tables.T_Acuerdos_prod),
        "select": [ 675, 676, 658, 677, 29, 669, 678],
        "where": `{58.EX.${fecha}}AND{489.EX.true}AND{680.EX.false}`
    }
    const args2 = {
        "to"  : String(Tables.T_Acuerdos_prod),
        "data": [{
            "680":{
                "value": "true"
            },
            "681":{
                "value": `${fecha}`
            }
        }]
    };

    const obs$ = ajax({
        createXHR,
        url: 'https://api.quickbase.com/v1/records/query',
        method: 'POST',
        headers,
        body: args1
    }).pipe(
        timeout(60000),
        retry(5),
        pluck('response', 'data')
    );
    
    obs$.subscribe((result:any[]) => {
        result.length < 1 ? res.json('No hay acuerdos que mandar') : null;
        
        result.forEach(value => {
            value['677']['value'] === '1' ? postAcuerdo(value, args2, res) : postBandeado(value, res);
        });
    },
    errors => {
        res.json(errors);
    });
});*/
router.get('/acuerdo1/:record/:type', (req, res) => {
    const url = 'https://api.quickbase.com/v1/records/query';
    const record = req.params.record;
    const type = req.params.type;
    let client = null;
    let table = '';
    let tableBanda = '';
    type == 'prod' ?
        (client = new node_rfc_1.Client(sap_1.abapSystem),
            table = String(utils_1.Tables.T_Acuerdos_prod),
            tableBanda = String(utils_1.Tables.T_Precios_Banda_prod)) :
        type == 'test' ?
            (client = new node_rfc_1.Client(sap_1.abapSystemTest),
                table = String(utils_1.Tables.T_Acuerdos_test),
                tableBanda = String(utils_1.Tables.T_Precios_Banda_test)) : null;
    const argsAcuerdos = {
        "from": table,
        "select": [675, 676, 658, 677, 29, 669, 678, 701, 699, 718, 719],
        "where": `{3.EX.${record}}AND{489.EX.true}AND{680.EX.false}`
    };
    const argsValidacionAcuerdo = {
        "to": table,
        "data": [{
                "680": {
                    "value": "true"
                },
                "3": {
                    "value": `${record}`
                }
            }]
    };
    const obs$ = ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsAcuerdos }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'data'));
    obs$.subscribe((result) => {
        const resultMenssage = [{ tipo: 'Acuerdo', value: 'No hay acuerdos que mandar' }];
        //return res.json(result);
        //result.length < 1 ? res.json('No hay acuerdos que mandar') : null;
        result.length < 1 ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[0] }) : null;
        result.forEach(value => {
            value['677']['value'] === '2' ? postAcuerdo(value, argsValidacionAcuerdo, res, client, table, record) :
                value['677']['value'] === '3' ? postBandeado(value, res, client, tableBanda) : null;
            /**
             * value['677']['value'] === '1' ?  postAcuerdo(value, argsValidacionAcuerdo, res, client) :
               value['677']['value'] === '0' ?  postBandeado(value, res, client, tableBanda) :
               value['677']['value'] === '2' ?  postPrecioXCorte(value, res, client, tableBanda) : null;
             */
        });
    }, errors => {
        res.json(errors);
    });
});
function postBandeado(value, res, client, tableBanda) {
    let arregloP = value['678']['value'];
    const url = 'https://api.quickbase.com/v1/records';
    arregloP.forEach((val) => {
        let codigoPrecio = val.split("-");
        const argsValidacion = {
            "to": tableBanda,
            "data": [{
                    "16": {
                        "value": "true"
                    },
                    "3": {
                        "value": `${codigoPrecio[2]}`
                    }
                }]
        };
        const args = {
            FECHA: String(value['675']['value']),
            USUARIO: String(value['676']['value']['email']),
            PROVEEDOR: String(value['658']['value']),
            OPERACION: String(value['677']['value']),
            MATERIAL: codigoPrecio[0],
            GRUPO_MATERIAL: "",
            //PRECIO          : String(codigoPrecio[1]+".00").substring(0,5),
            PRECIO: codigoPrecio[1],
            MONEDA: String(value['669']['value']),
            CORTE: "",
            ORDEN_COMPRA: "",
            CENTRO: String(value['718']['value']),
            ORG_COMPRAS: String(value['719']['value']),
        };
        //res.json(args);
        //referencia mensajes mensajesAcuerdo
        args.FECHA == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[1] }) :
            args.USUARIO == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[2] }) :
                args.PROVEEDOR == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[3] }) :
                    args.OPERACION == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[4] }) :
                        args.PRECIO == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[5] }) :
                            args.MONEDA == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[6] }) : null;
        client.connect((resul, er) => {
            er ? res.json({ ok: false, message: er }) : null;
            client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (error, resultado) => __awaiter(this, void 0, void 0, function* () {
                error ? res.json({ ok: false, message: error }) : null;
                const obs$ = ajax_1.ajax({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: argsValidacion }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata'));
                const menssage200 = [{ tipo: '200', value: resultado['MENSAJE'], lastresponse: resultado['LASTRESPONSE'] }];
                const menssage201 = [{ tipo: '201', value: resultado['MENSAJE'], lastresponse: resultado['LASTRESPONSE'] }];
                const menssage202 = [{ tipo: '202', value: resultado['MENSAJE'], lastresponse: resultado['LASTRESPONSE'] }];
                const menssage03 = [{ tipo: 'Warning', value: resultado['MENSAJE'], lastresponse: resultado['LASTRESPONSE'] }];
                //obs$.subscribe(respuesta => res.json(resultado['MENSAJE'])
                //res.render(`${pathViews}/acuerdos.hbs` , { mensaje: mensajesAcuerdo[1]}
                String(resultado['MENSAJE']).substring(0, 3) === '200' ? obs$.subscribe(respuesta => res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage200 }), err => res.json(err)) :
                    String(resultado['MENSAJE']).substring(0, 3) === '201' ? obs$.subscribe(respuesta => res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage201 }), err => res.json(err)) :
                        String(resultado['MENSAJE']).substring(0, 3) === '202' ? obs$.subscribe(respuesta => res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage202 }), err => res.json(err)) : res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage03 }); //res.json(resultado);
            }));
        });
    });
}
function postAcuerdo(value, args2, res, client, table, record) {
    let valor = String(value['29']['value']).split('.');
    let precio = valor[0] + '.' + valor[1] + 0;
    valor.length > 1 ? precio : precio = valor[0];
    const args = {
        FECHA: String(value['675']['value']),
        USUARIO: String(value['676']['value']['email']),
        PROVEEDOR: String(value['658']['value']),
        OPERACION: String(value['677']['value']),
        MATERIAL: "",
        GRUPO_MATERIAL: "001",
        PRECIO: String(precio).substring(0, 5),
        MONEDA: String(value['669']['value']),
        CORTE: "",
        ORDEN_COMPRA: "",
        CENTRO: String(value['718']['value']),
        ORG_COMPRAS: String(value['719']['value']),
    };
    args.FECHA == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[1] }) :
        args.USUARIO == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[2] }) :
            args.PROVEEDOR == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[3] }) :
                args.OPERACION == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[4] }) :
                    args.PRECIO == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[5] }) :
                        args.MONEDA == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[6] }) : null;
    client.connect((resul, er) => {
        er ? res.json({ ok: false, message: er }) : null;
        client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (error, resultado) => {
            error ? res.json({ ok: false, message: error }) : null;
            let bodyData = null;
            const actualizarAcuerdo = {
                "to": table,
                "data": [{
                        "680": {
                            "value": "false"
                        },
                        "3": {
                            "value": `${record}`
                        }
                    }]
            };
            if (resultado['LASTRESPONSE'] === 'X') {
                bodyData = args2;
            }
            else {
                bodyData = actualizarAcuerdo;
            }
            //res.json({bodyData});
            const obs$ = ajax_1.ajax({
                createXHR: utils_1.createXHR,
                url: 'https://api.quickbase.com/v1/records',
                method: 'POST',
                headers: utils_1.headers,
                body: bodyData
            }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata'));
            const menssage100 = [{ tipo: '100', value: resultado['MENSAJE'], lastresponse: resultado['LASTRESPONSE'] }];
            const menssage101 = [{ tipo: '101', value: resultado['MENSAJE'], lastresponse: resultado['LASTRESPONSE'] }];
            const menssage03 = [{ tipo: 'Warning', value: resultado['MENSAJE'], lastresponse: resultado['LASTRESPONSE'] }];
            //res.render(`${pathViews}/acuerdos.hbs` , { mensaje: menssage200 })
            // obs$.subscribe(resp => res.json(resultado['MENSAJE'])
            String(resultado['MENSAJE']).substring(0, 3) === '100' ? obs$.subscribe(resp => res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage100 }), err => res.json(err)) :
                String(resultado['MENSAJE']).substring(0, 3) === '101' ? obs$.subscribe(resp => res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage101 }), err => res.json(err)) : res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage03 }); //res.json( resultado );
        });
    });
}
function postPrecioXCorte(value, res, client, tableBAnda) {
    let valor = null;
    value['701']['value'].forEach((item) => {
        valor = String(item).split('-');
        const argsValidacionMateriales = {
            "to": tableBAnda,
            "data": [{
                    "16": {
                        "value": "true"
                    },
                    "3": {
                        "value": `${valor[2]}`
                    }
                }]
        };
        const args = {
            FECHA: String(value['675']['value']),
            USUARIO: String(value['676']['value']['email']),
            PROVEEDOR: String(value['658']['value']),
            OPERACION: String(value['677']['value']),
            MATERIAL: valor[0],
            GRUPO_MATERIAL: "",
            PRECIO: String(Number(valor[1]).toFixed(2)),
            MONEDA: String(value['669']['value']),
            CORTE: "",
            ORDEN_COMPRA: String(value['699']['value']),
            CENTRO: String(value['718']['value']),
            ORG_COMPRAS: String(value['719']['value']),
        };
        args.FECHA == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[1] }) :
            args.USUARIO == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[2] }) :
                args.PROVEEDOR == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[3] }) :
                    args.OPERACION == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[4] }) :
                        args.PRECIO == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[5] }) :
                            args.MONEDA == "" ? res.render(`${pathViews}/acuerdos.hbs`, { mensaje: utils_1.mensajesAcuerdo[6] }) : null;
        client.connect((resul, er) => {
            er ? res.json({ ok: false, message: er }) : null;
            client.invoke('Z_RFC_VA_PRECIOACUERDO', args, (error, resultado) => {
                error ? res.json({ ok: false, message: error }) : null;
                const obs$ = ajax_1.ajax({
                    createXHR: utils_1.createXHR,
                    url: 'https://api.quickbase.com/v1/records',
                    method: 'POST',
                    headers: utils_1.headers,
                    body: argsValidacionMateriales
                }).pipe(operators_1.timeout(60000), operators_1.retry(5), operators_1.pluck('response', 'metadata'));
                //obs$.subscribe(resp => res.json({ resp, resultado }) );
                const menssage300 = [{ tipo: '300', value: resultado['MENSAJE'] }];
                const menssage301 = [{ tipo: '301', value: resultado['MENSAJE'] }];
                const menssage03 = [{ tipo: 'Warning', value: resultado['MENSAJE'] }];
                //res.render(`${pathViews}/acuerdos.hbs` , { mensaje: menssage200 })
                //obs$.subscribe(resp => res.json({ resp, resultado })
                String(resultado['MENSAJE']).substring(0, 3) === '300' ? obs$.subscribe(resp => res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage300 }), err => res.json(err)) :
                    String(resultado['MENSAJE']).substring(0, 3) === '301' ? obs$.subscribe(resp => res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage301 }), err => res.json(err)) : res.render(`${pathViews}/acuerdos.hbs`, { mensaje: menssage03 }); //res.json( resultado );
            });
        });
    });
}
exports.default = router;
