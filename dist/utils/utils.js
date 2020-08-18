"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createXHR = exports.headers = void 0;
const xmlhttprequest_1 = require("xmlhttprequest");
exports.headers = {
    'QB-Realm-Hostname': 'aortizdemontellanoarevalo.quickbase.com',
    'User-Agent': 'Acuerdos',
    'Authorization': 'QB-USER-TOKEN b4czas_fwjc_3v7g2fym488vcr4zujjdx7tdax',
    'Content-Type': 'application/json'
};
function createXHR() {
    return new xmlhttprequest_1.XMLHttpRequest();
}
exports.createXHR = createXHR;
