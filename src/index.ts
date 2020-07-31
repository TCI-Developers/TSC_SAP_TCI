import Server from './server/server';
import router from './router/router';
require('dotenv').config();

 const port = process.env.PORT || 3005;
 const server = Server.init(Number(port));
 server.app.use(router);

 server.start( () =>{
     console.log('Servidor corriendo '+port);
 });