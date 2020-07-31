"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abapSystem = void 0;
require('dotenv').config();
exports.abapSystem = {
    user: process.env.TCI_SAP_USER,
    passwd: process.env.TCI_SAP_PASS,
    ashost: process.env.TCI_SAP_ASHOST,
    sysnr: process.env.TCI_SAP_SYSNR,
    client: process.env.TCI_SAP_CLIENT,
    lang: process.env.TCI_SAP_LANG,
};
