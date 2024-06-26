"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server/server"));
const router_1 = __importDefault(require("./router/router"));
const materiales_1 = __importDefault(require("./router/materiales"));
const proveedores_1 = __importDefault(require("./router/proveedores"));
const facturadores_1 = __importDefault(require("./router/facturadores"));
const agranel_1 = __importDefault(require("./router/agranel"));
//import flete from './router/flete';
const flete_1 = __importDefault(require("./router/flete"));
const flotilla_1 = __importDefault(require("./router/flotilla"));
const vinculacion_1 = __importDefault(require("./router/vinculacion"));
const actualizarPrecio_1 = __importDefault(require("./router/actualizarPrecio"));
const pedidos_1 = __importDefault(require("./router/pedidos"));
const embalaje_1 = __importDefault(require("./router/embalaje"));
const venta_1 = __importDefault(require("./router/venta"));
const embarques_1 = __importDefault(require("./router/embarques"));
const detalleEmbarque_1 = __importDefault(require("./router/detalleEmbarque"));
const picking_1 = __importDefault(require("./router/picking"));
const cliente_1 = __importDefault(require("./router/cliente"));
const resultadoCorrida_1 = __importDefault(require("./router/resultadoCorrida"));
const ordenesGastos_1 = __importDefault(require("./router/ordenesGastos"));
const forecast_1 = __importDefault(require("./router/forecast"));
const kpi_costos_cortes_1 = __importDefault(require("./router/kpi-costos-cortes"));
const toneladas_recibidas_1 = __importDefault(require("./router/toneladas-recibidas"));
const comparativa_calibres_1 = __importDefault(require("./router/comparativa-calibres"));
const huertas_1 = __importDefault(require("./router/huertas"));
const utilizacionAcarreo_1 = __importDefault(require("./router/utilizacionAcarreo"));
const costoTipoCorte_1 = __importDefault(require("./router/costoTipoCorte"));
const salidasenfalso_1 = __importDefault(require("./router/salidasenfalso"));
const comparativaV2_1 = __importDefault(require("./router/comparativaV2"));
const defectos_1 = __importDefault(require("./router/defectos"));
const precios_categorias_1 = __importDefault(require("./router/precios_categorias"));
const comparativasv3_1 = __importDefault(require("./router/comparativasv3"));
require('dotenv').config();
const port = process.env.PORT || 3005;
const server = server_1.default.init(Number(port));
server.app.use(router_1.default);
server.app.use(materiales_1.default);
server.app.use(proveedores_1.default);
server.app.use(facturadores_1.default);
server.app.use(agranel_1.default);
server.app.use(flete_1.default);
server.app.use(flotilla_1.default);
server.app.use(vinculacion_1.default);
server.app.use(actualizarPrecio_1.default);
server.app.use(pedidos_1.default);
server.app.use(embalaje_1.default);
server.app.use(venta_1.default);
server.app.use(embarques_1.default);
server.app.use(detalleEmbarque_1.default);
server.app.use(picking_1.default);
server.app.use(cliente_1.default);
server.app.use(resultadoCorrida_1.default);
server.app.use(ordenesGastos_1.default);
server.app.use(forecast_1.default);
server.app.use(kpi_costos_cortes_1.default);
server.app.use(toneladas_recibidas_1.default);
server.app.use(comparativa_calibres_1.default);
server.app.use(utilizacionAcarreo_1.default);
server.app.use(huertas_1.default);
server.app.use(costoTipoCorte_1.default);
server.app.use(salidasenfalso_1.default);
server.app.use(comparativaV2_1.default);
server.app.use(defectos_1.default);
server.app.use(precios_categorias_1.default);
server.app.use(comparativasv3_1.default);
server.start(() => {
    console.log('Servidor corriendo ' + port);
});
