"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server/server"));
const router_1 = __importDefault(require("./router/router"));
const materiales_1 = __importDefault(require("./router/materiales"));
const proveedores_1 = __importDefault(require("./router/proveedores"));
require('dotenv').config();
const port = process.env.PORT || 3005;
const server = server_1.default.init(Number(port));
server.app.use(router_1.default);
server.app.use(materiales_1.default);
server.app.use(proveedores_1.default);
server.start(() => {
    console.log('Servidor corriendo ' + port);
});
