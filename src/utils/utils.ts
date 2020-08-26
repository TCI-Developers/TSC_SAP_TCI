import { XMLHttpRequest } from 'xmlhttprequest';
import { Client } from "node-rfc";
import { abapSystem } from "../sap/sap";

export const headers = {
    'QB-Realm-Hostname': 'aortizdemontellanoarevalo.quickbase.com',
    'User-Agent': 'Acuerdos',
    'Authorization': 'QB-USER-TOKEN b4czas_fwjc_3v7g2fym488vcr4zujjdx7tdax',
    'Content-Type': 'application/json'
  }

  export function createXHR() {
      return new XMLHttpRequest();
  }