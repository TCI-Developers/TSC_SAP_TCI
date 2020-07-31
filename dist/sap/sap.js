"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abapSystem = void 0;
require('dotenv').config();
exports.abapSystem = {
    user: String(process.env.TCI_SAP_USER),
    passwd: String(process.env.TCI_SAP_PASS),
    ashost: String(process.env.TCI_SAP_ASHOST),
    sysnr: String(process.env.TCI_SAP_SYSNR),
    client: String(process.env.TCI_SAP_CLIENT),
    lang: String(process.env.TCI_SAP_LANG),
};
