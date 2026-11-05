const { DataTypes: D } = require('sequelize');
const sequelize = require('../config/database');
const text = (unique = false) => ({ type: D.STRING, allowNull: false, unique, validate: { notEmpty: true } });
const date = () => ({ type: D.DATEONLY, allowNull: false });
const money = () => ({ type: D.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } });
const state = values => ({ type: D.STRING, allowNull: false, validate: { isIn: [values] } });
const fk = model => ({ type: D.INTEGER, allowNull: false, references: { model, key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
const define = (name, fields) => sequelize.define(name, fields, { timestamps: false, freezeTableName: true });
const Cliente = define('clientes', { nombre: text(), apellidos: text(), correo: { ...text(true), validate: { isEmail: true } }, telefono: text(), identificacion: text(true), direccion: text(), fechaRegistro: date(), estado: state(['activo', 'inactivo']) });
const Casillero = define('casilleros', { numero: text(true), direccionMiami: text(), fechaApertura: date(), estado: state(['activo', 'inactivo']), clienteId: fk('clientes') });
const Envio = define('envios', { codigo: text(true), fechaSalida: date(), fechaEstimadaEntrega: date(), estado: state(['pendiente', 'en_transito', 'entregado']), costoTotal: money(), clienteId: fk('clientes') });
const Paquete = define('paquetes', { tracking: text(true), tiendaOrigen: text(), descripcion: text(), pesoKg: { type: D.DECIMAL(10, 3), allowNull: false, validate: { min: 0.001 } }, valorDeclaradoUsd: money(), fechaRecepcion: date(), estado: state(['recibido', 'en_bodega', 'en_transito', 'entregado']), casilleroId: fk('casilleros'), envioId: { ...fk('envios'), allowNull: true } });
const Factura = define('facturas', { numero: text(true), fecha: date(), subtotal: money(), impuestos: money(), total: money(), metodoPago: state(['tarjeta', 'transferencia', 'efectivo']), estadoPago: state(['pendiente', 'pagado', 'anulado']), envioId: { ...fk('envios'), unique: true } });
Cliente.hasMany(Casillero, { foreignKey: 'clienteId', onDelete: 'RESTRICT' }); Casillero.belongsTo(Cliente, { foreignKey: 'clienteId' });
Cliente.hasMany(Envio, { foreignKey: 'clienteId', onDelete: 'RESTRICT' }); Envio.belongsTo(Cliente, { foreignKey: 'clienteId' });
Casillero.hasMany(Paquete, { foreignKey: 'casilleroId', onDelete: 'RESTRICT' }); Paquete.belongsTo(Casillero, { foreignKey: 'casilleroId' });
Envio.hasMany(Paquete, { foreignKey: 'envioId', onDelete: 'RESTRICT' }); Paquete.belongsTo(Envio, { foreignKey: 'envioId' });
Envio.hasOne(Factura, { foreignKey: 'envioId', onDelete: 'RESTRICT' }); Factura.belongsTo(Envio, { foreignKey: 'envioId' });
// Entidades operativas adicionales: catálogos, logística, tarifas y seguimiento.
const Pais = define('paises', { codigo: text(true), nombre: text(), estado: state(['activo', 'inactivo']) });
const Sucursal = define('sucursales', { codigo: text(true), nombre: text(), direccion: text(), telefono: text(), estado: state(['activo', 'inactivo']), paisId: fk('paises') });
const Bodega = define('bodegas', { codigo: text(true), nombre: text(), direccion: text(), estado: state(['activo', 'inactivo']), sucursalId: fk('sucursales') });
const Ubicacion = define('ubicaciones', { codigo: text(true), pasillo: text(), estante: text(), estado: state(['disponible', 'bloqueada']), bodegaId: fk('bodegas') });
const Transportista = define('transportistas', { codigo: text(true), nombre: text(), telefono: text(), correo: { ...text(true), validate: { isEmail: true } }, estado: state(['activo', 'inactivo']), paisId: fk('paises') });
const Servicio = define('servicios', { codigo: text(true), nombre: text(), descripcion: text(), estado: state(['activo', 'inactivo']) });
const Tarifa = define('tarifas', { codigo: text(true), precioPorKg: money(), cargoBase: money(), fechaVigencia: date(), estado: state(['activo', 'inactivo']), servicioId: fk('servicios'), paisId: fk('paises'), transportistaId: fk('transportistas') });
const Movimiento = define('movimientos', { codigo: text(true), fecha: date(), tipo: state(['entrada', 'traslado', 'salida']), observaciones: text(), estado: state(['registrado', 'anulado']), paqueteId: fk('paquetes'), ubicacionId: fk('ubicaciones') });
const Entrega = define('entregas', { codigo: text(true), fechaProgramada: date(), destinatario: text(), direccion: text(), estado: state(['pendiente', 'en_ruta', 'entregado', 'fallido']), envioId: fk('envios'), sucursalId: fk('sucursales'), transportistaId: fk('transportistas') });
const Incidencia = define('incidencias', { codigo: text(true), fecha: date(), descripcion: text(), prioridad: state(['baja', 'media', 'alta']), estado: state(['abierta', 'en_revision', 'resuelta']), paqueteId: fk('paquetes') });
const models = { clientes: Cliente, casilleros: Casillero, envios: Envio, paquetes: Paquete, facturas: Factura,
  paises: Pais, sucursales: Sucursal, bodegas: Bodega, ubicaciones: Ubicacion, transportistas: Transportista,
  servicios: Servicio, tarifas: Tarifa, movimientos: Movimiento, entregas: Entrega, incidencias: Incidencia };
// Derivar asociaciones de las FK mantiene una única definición de cada relación nueva.
for (const model of [Pais, Sucursal, Bodega, Ubicacion, Transportista, Servicio, Tarifa, Movimiento, Entrega, Incidencia]) {
  for (const [key, attr] of Object.entries(model.rawAttributes)) if (attr.references) {
    const parent = models[attr.references.model];
    parent.hasMany(model, { foreignKey: key, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    model.belongsTo(parent, { foreignKey: key, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  }
}
models.usuarios = require('./usuario')(sequelize);
module.exports = { sequelize, models };


