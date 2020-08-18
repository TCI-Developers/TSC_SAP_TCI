import express = require('express');
import path from "path";
import bodyParser from 'body-parser';
import cors from 'cors';

export default class Server {

    public app:express.Application;
    public port: number;

    constructor(port:number){
        this.port = port;
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(cors());
    }

    static init (port:number) {
        return new Server(port);
    }

    start( callback:() => void){
        this.app.listen(this.port, callback);
        this.publicFolder();
    }

    private publicFolder () {
        const publicPath = path.resolve(__dirname, '../public');
        this.app.use(express.static(publicPath) );
    }
}