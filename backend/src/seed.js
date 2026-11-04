const { sequelize, models } = require('./models');
const samples = {
  "clientes": {
    "nombre": "Ana",
    "apellidos": "Solano Mora",
    "correo": "ana@example.com",
    "telefono": "+50688887777",
    "identificacion": "112340567",
    "direccion": "San José, Costa Rica",
    "fechaRegistro": "2026-11-04",
    "estado": "activo"
  },
  "casilleros": {
    "numero": "AERO-1001",
    "direccionMiami": "8500 NW 30th Terrace, Miami, FL",
    "fechaApertura": "2026-11-04",
    "estado": "activo",
    "clienteId": 1
  },
  "envios": {
    "codigo": "ENV-1001",
    "fechaSalida": "2026-11-04",
    "fechaEstimadaEntrega": "2026-11-10",
    "estado": "pendiente",
    "costoTotal": 35,
    "clienteId": 1
  },
  "paquetes": {
    "tracking": "SHOP-1001",
    "tiendaOrigen": "Amazon",
    "descripcion": "Audífonos",
    "pesoKg": 0.5,
    "valorDeclaradoUsd": 60,
    "fechaRecepcion": "2026-11-04",
    "estado": "en_bodega",
    "casilleroId": 1,
    "envioId": 1
  },
  "facturas": {
    "numero": "FAC-1001",
    "fecha": "2026-11-04",
    "subtotal": 35,
    "impuestos": 4.55,
    "total": 39.55,
    "metodoPago": "transferencia",
    "estadoPago": "pendiente",
    "envioId": 1
  }
};
async function seed() {
  await sequelize.sync();
  await sequelize.transaction(async transaction => {
    const [cliente] = await models.clientes.findOrCreate({ where: { correo: samples.clientes.correo }, defaults: samples.clientes, transaction });
    const [casillero] = await models.casilleros.findOrCreate({ where: { numero: samples.casilleros.numero }, defaults: { ...samples.casilleros, clienteId: cliente.id }, transaction });
    const [envio] = await models.envios.findOrCreate({ where: { codigo: samples.envios.codigo }, defaults: { ...samples.envios, clienteId: cliente.id }, transaction });
    await models.paquetes.findOrCreate({ where: { tracking: samples.paquetes.tracking }, defaults: { ...samples.paquetes, casilleroId: casillero.id, envioId: envio.id }, transaction });
    await models.facturas.findOrCreate({ where: { numero: samples.facturas.numero }, defaults: { ...samples.facturas, envioId: envio.id }, transaction });
  });
  console.log('Seed completado: Ana Solano, casillero, paquete, envío y factura.');
}
seed().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => sequelize.close());
