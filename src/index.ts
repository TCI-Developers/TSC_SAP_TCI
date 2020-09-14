import Server from './server/server';
import router from './router/router';
import matareiales from './router/materiales';
import proveedor from './router/proveedores';
import facturador from './router/facturadores';
import agranel from './router/agranel';
import flete from './router/flete';
import flotilla from './router/flotilla';
require('dotenv').config();

 const port = process.env.PORT || 3005;
 const server = Server.init(Number(port));
 server.app.use(router);
 server.app.use(matareiales);
 server.app.use(proveedor);
 server.app.use(facturador);
 server.app.use(agranel);
 server.app.use(flete);
 server.app.use(flotilla);

 server.start( () =>{
     console.log('Servidor corriendo '+port);
 });