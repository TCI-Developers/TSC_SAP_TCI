import { XMLHttpRequest } from 'xmlhttprequest';

export const headers = {
    'QB-Realm-Hostname': 'aortizdemontellanoarevalo.quickbase.com',
    'User-Agent': 'Acuerdos',
    'Authorization': 'QB-USER-TOKEN b4czas_fwjc_3v7g2fym488vcr4zujjdx7tdax',
    'Content-Type': 'application/json'
  }

  export function createXHR() {
      return new XMLHttpRequest();
  }