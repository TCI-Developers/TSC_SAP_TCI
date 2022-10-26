"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
class Server {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.app.use(body_parser_1.default.json());
        this.app.use(cors_1.default());
        this.app.set('view engine', 'hbs');
    }
    static init(port) {
        return new Server(port);
    }
    start(callback) {
        this.app.listen(this.port, callback);
        this.publicFolder();
    }
    publicFolder() {
        const publicPath = path_1.default.resolve(__dirname, '../public');
        this.app.use(express.static(publicPath));
    }
}
exports.default = Server;
