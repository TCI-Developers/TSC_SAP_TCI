import Server from './server/server';
import router from './router/router';
import matareiales from './router/materiales';
import proveedor from './router/proveedores';
import facturador from './router/facturadores';
import agranel from './router/agranel';
//import flete from './router/flete';
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
import ordenesGastos from './router/ordenesGastos';
import forecast from './router/forecast';
import kpicostos from './router/kpi-costos-cortes';
import tonrecibidas from './router/toneladas-recibidas';
import comparativas from './router/comparativa-calibres';
import huertas from './router/huertas';
import uacarreo from './router/utilizacionAcarreo';
import costocorte from './router/costoTipoCorte';
import salidasEnFalso from './router/salidasenfalso';
import lotesCorridas from './router/comparativaV2';
import defectos from './router/defectos';




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
 server.app.use(ordenesGastos);
 server.app.use(forecast);
 server.app.use(kpicostos);
 server.app.use(tonrecibidas);
 server.app.use(comparativas);
 server.app.use(uacarreo);
 server.app.use(huertas);
 server.app.use(costocorte);
 server.app.use(salidasEnFalso);
 server.app.use(lotesCorridas);
 server.app.use(defectos);




 server.start( () =>{
     console.log('Servidor corriendo '+port);
 });