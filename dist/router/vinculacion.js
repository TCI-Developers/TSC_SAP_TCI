"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const utils_1 = require("../utils/utils");
const vinculacion = (0, express_1.Router)();
vinculacion.get('/vinculacion/:idProductor/:nombres', (req, res) => {
    const huertas = req.params.nombres.split(';');
    const record = req.params.idProductor;
    let huertasF = [];
    for (const iterator of huertasF) {
        const url = 'https://api.quickbase.com/v1/records';
        const args = {
            "to": "bqt3249tp",
            "data": [{
                    "6": { "value": record },
                    "17": { "value": iterator },
                }]
        };
        (0, ajax_1.ajax)({ createXHR: utils_1.createXHR, url, method: 'POST', headers: utils_1.headers, body: args }).pipe((0, operators_1.timeout)(10000), (0, operators_1.retry)(1), (0, operators_1.pluck)('response', 'data')).subscribe(resp => {
            res.json(resp);
        });
    }
});
exports.default = vinculacion;
