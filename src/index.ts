import Server from './server/server';
import router from './router/router';
import matareiales from './router/materiales';
import proveedor from './router/proveedores';
import facturador from './router/facturadores';
import agranel from './router/agranel';
import flete from './router/flete';
import flotilla from './router/flotilla';
import vinculacion from './router/vinculacion';
import act from './router/actualizarPrecio';
import pedidos from './router/pedidos';
import embalaje from './router/embalaje';
import venta from './router/venta';
import embarque from './router/embarques';
import detalleEmbarque from './router/detalleEmbarque';
import picking from './router/picking';
import cliente from './router/cliente';
import resultadoCorrida from './router/resultadoCorrida';
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
 server.app.use(vinculacion);
 server.app.use(act);
 server.app.use(pedidos);
 server.app.use(embalaje);
 server.app.use(venta);
 server.app.use(embarque);
 server.app.use(detalleEmbarque);
 server.app.use(picking);
 server.app.use(cliente);
 server.app.use(resultadoCorrida);

 server.start( () =>{
     console.log('Servidor corriendo '+port);
 });