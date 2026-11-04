process.env.DB_STORAGE = ':memory:';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const { sequelize } = require('../src/models');
test('CRUD, validaciones, referencias y respuestas JSON', async () => {
  await sequelize.sync();
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  async function request(method, route, body, status) {
    const r = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    const json = await r.json();
    assert.equal(r.status, status, method + ' ' + route + ': ' + JSON.stringify(json));
    assert.equal(json.ok, status < 400);
    if (status >= 400) assert.ok(Array.isArray(json.errors));
    return json.data;
  }
  try {
    const samples = {
      clientes: { nombre: 'Ana', apellidos: 'Solano', correo: 'ana@example.com', telefono: '88887777', identificacion: '123', direccion: 'San José', fechaRegistro: '2026-11-04', estado: 'activo' },
      casilleros: { numero: 'A1', direccionMiami: 'Miami', fechaApertura: '2026-11-04', estado: 'activo', clienteId: 1 },
      envios: { codigo: 'E1', fechaSalida: '2026-11-04', fechaEstimadaEntrega: '2026-11-10', estado: 'pendiente', costoTotal: 35, clienteId: 1 },
      paquetes: { tracking: 'T1', tiendaOrigen: 'Amazon', descripcion: 'Audífonos', pesoKg: 1, valorDeclaradoUsd: 50, fechaRecepcion: '2026-11-04', estado: 'recibido', casilleroId: 1, envioId: 1 },
      facturas: { numero: 'F1', fecha: '2026-11-04', subtotal: 35, impuestos: 4.55, total: 39.55, metodoPago: 'tarjeta', estadoPago: 'pendiente', envioId: 1 }
    };
    for (const [name, sample] of Object.entries(samples)) {
      await request('POST', '/' + name, {}, 400);
      const created = await request('POST', '/' + name, sample, 201);
      assert.equal(created.id, 1);
      const rows = await request('GET', '/' + name + '?page=1&limit=1', undefined, 200); assert.equal(rows.length, 1);
      await request('GET', '/' + name + '/1', undefined, 200);
      await request('PUT', '/' + name + '/1', sample, 200);
      await request('GET', '/' + name + '/9999', undefined, 404);
      await request('PUT', '/' + name + '/9999', sample, 404);
      await request('DELETE', '/' + name + '/9999', undefined, 404);
      await request('POST', '/' + name, sample, 409);
      await request('GET', '/' + name + '?limit=0', undefined, 400);
    }
    for (const name of ['clientes', 'casilleros', 'envios']) await request('DELETE', '/' + name + '/1', undefined, 409);
    await request('POST', '/clientes', { ...samples.clientes, correo: 'incorrecto', identificacion: '456' }, 400);
    await request('PUT', '/paquetes/1', { pesoKg: -1 }, 400);
    await request('PUT', '/paquetes/1', { pesoKg: '2' }, 400);
    await request('PUT', '/paquetes/1', { estado: 'perdido' }, 400);
    await request('PUT', '/paquetes/1', { fechaRecepcion: '2026-02-30' }, 400);
    await request('PUT', '/casilleros/1', { clienteId: 9999 }, 400);
    await request('PUT', '/facturas/1', { total: 1 }, 400);
    await request('PUT', '/envios/1', { fechaEstimadaEntrega: '2026-01-01' }, 400);
    await request('PUT', '/clientes/1', { campoAjeno: true }, 400);
    await request('GET', '/clientes/abc', undefined, 400);
    const second = await request('POST', '/clientes', { ...samples.clientes, correo: 'otro@example.com', identificacion: '456' }, 201);
    const box = await request('POST', '/casilleros', { ...samples.casilleros, numero: 'A2', clienteId: second.id }, 201);
    await request('PUT', '/paquetes/1', { casilleroId: box.id }, 400);
    await request('PUT', '/envios/1', { clienteId: second.id }, 409);
    await request('PUT', '/casilleros/1', { clienteId: second.id }, 409);
    assert.equal((await request('GET', '/clientes?q=Ana', undefined, 200)).length, 2);
    assert.equal((await request('GET', '/resumen', undefined, 200)).paquetes, 1);
    await request('GET', '/health', undefined, 200);
    await request('GET', '/inexistente', undefined, 404);
    const malformed = await fetch(base + '/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); assert.equal(malformed.status, 400); assert.equal((await malformed.json()).ok, false);
    for (const name of ['facturas', 'paquetes', 'envios', 'casilleros', 'clientes']) await request('DELETE', '/' + name + '/1', undefined, 200);
    await request('DELETE', '/casilleros/' + box.id, undefined, 200);
    await request('DELETE', '/clientes/' + second.id, undefined, 200);
  } finally { await new Promise(resolve => server.close(resolve)); await sequelize.close(); }
});
