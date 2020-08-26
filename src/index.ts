import Server from './server/server';
import router from './router/router';
import matareiales from './router/materiales';
import proveedor from './router/proveedores';
require('dotenv').config();

 const port = process.env.PORT || 3005;
 const server = Server.init(Number(port));
 server.app.use(router);
 server.app.use(matareiales);
 server.app.use(proveedor);

 server.start( () =>{
     console.log('Servidor corriendo '+port);
 });