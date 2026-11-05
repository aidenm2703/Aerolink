const { test } = require('node:test');
const assert = require('node:assert/strict');

module.exports = function runSuite(mysql) {
  if (!mysql) { process.env.DB_DIALECT = 'sqlite'; process.env.DB_STORAGE = ':memory:'; delete process.env.DATABASE_URL; }
  const app = require('../src/app');
  const { sequelize, models } = require('../src/models');
  const samples = require('../src/data/samples.json');
  test('16 entidades: CRUD HTTP, relaciones, filtros y errores en ' + (mysql ? 'MySQL' : 'SQLite'), async () => {
    assert.equal(sequelize.getDialect(), mysql ? 'mysql' : 'sqlite');
    assert.equal(Object.keys(models).length, 16);
    if (!mysql) await sequelize.sync();
    else await sequelize.authenticate();
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port + '/api';
    const ids = {}, suffix = 'TEST-' + require('crypto').randomUUID();
    let requests = 0, token, accountId;
    async function request(method, route, body, expected) {
      requests++;
      const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
      const result = await response.json();
      assert.equal(response.status, expected, method + ' ' + route + ': ' + JSON.stringify(result));
      assert.equal(result.ok, expected < 400);
      if (expected >= 400) assert.ok(Array.isArray(result.errors));
      return result.data;
    }
    try {
      accountId = (await request('POST', '/auth/register', { nombre: 'Pruebas', correo: suffix + '@example.com', password: 'Prueba-segura-2026' }, 201)).id;
      token = (await request('POST', '/auth/login', { correo: suffix + '@example.com', password: 'Prueba-segura-2026' }, 200)).token;
      for (const [name, sample] of Object.entries(samples)) {
        const data = { ...sample }, model = models[name];
        for (const [key, attr] of Object.entries(model.rawAttributes)) {
          if (attr.references && data[key] != null) data[key] = ids[attr.references.model];
          if (attr.unique && !attr.references) data[key] = key === 'correo' ? suffix + '@example.com' : suffix;
        }
        const created = await request('POST', '/' + name, data, 201);
        ids[name] = created.id;
        await request('GET', '/' + name + '/' + created.id, undefined, 200);
        assert.ok((await request('GET', '/' + name + '?q=' + suffix, undefined, 200)).some(row => row.id === created.id));
        const stateKey = name === 'facturas' ? 'estadoPago' : 'estado';
        assert.ok((await request('GET', '/' + name + '?q=' + suffix + '&estado=' + data[stateKey] + '&limit=100', undefined, 200)).some(row => row.id === created.id));
        await request('PUT', '/' + name + '/' + created.id, data, 200);
        await request('POST', '/' + name, data, 409);
        await request('POST', '/' + name, {}, 400);
        await request('GET', '/' + name + '?estado=invalido', undefined, 400);
        await request('PUT', '/' + name + '/' + created.id, { [stateKey]: 'invalido' }, 400);
        await request('GET', '/' + name + '?limit=0', undefined, 400);
        // Cada FK debe existir y proteger al padre de eliminaciones accidentales.
        for (const [key, attr] of Object.entries(model.rawAttributes)) if (attr.references) {
          await request('PUT', '/' + name + '/' + created.id, { [key]: 2147483647 }, 400);
          await request('DELETE', '/' + attr.references.model + '/' + ids[attr.references.model], undefined, 409);
        }
      }
      const user = await request('POST', '/usuarios', { nombre: 'Usuario de prueba', correo: suffix + '-crud@example.com', password: 'Prueba-segura-2026' }, 201);
      ids.usuarios = user.id;
      assert.equal(user.password, undefined);
      await request('GET', '/usuarios/' + user.id, undefined, 200);
      await request('GET', '/usuarios?q=' + suffix, undefined, 200);
      await request('PUT', '/usuarios/' + user.id, { nombre: 'Nombre actualizado' }, 200);
      await request('POST', '/usuarios', { nombre: 'Duplicado', correo: suffix + '-crud@example.com', password: 'Prueba-segura-2026' }, 409);
      await request('POST', '/usuarios', {}, 400);
      const factura = await request('PUT', '/facturas/' + ids.facturas, { estadoPago: 'pagado' }, 200);
      assert.equal(Number(factura.total), 39.55);
      await request('PUT', '/facturas/' + ids.facturas, { total: 1 }, 400);
      await request('PUT', '/tarifas/' + ids.tarifas, { precioPorKg: -1 }, 400);
      await request('PUT', '/tarifas/' + ids.tarifas, { fechaVigencia: '2026-02-30' }, 400);
      const resumen = await request('GET', '/resumen', undefined, 200);
      assert.equal(Object.keys(resumen).length, 16);
      for (const name of Object.keys(models)) assert.ok(resumen[name] >= 1);
      await request('GET', '/health', undefined, 200);
    } finally {
      try {
        // Orden inverso de creación: solo registros propios, sin truncar tablas.
        for (const name of ['usuarios', ...Object.keys(samples).reverse()]) if (ids[name]) {
          await request('DELETE', '/' + name + '/' + ids[name], undefined, 200);
          await request('GET', '/' + name + '/' + ids[name], undefined, 404);
        }
        if (accountId) await request('DELETE', '/usuarios/' + accountId, undefined, 200);
      } finally {
        await new Promise(resolve => server.close(resolve));
        await sequelize.close();
      }
    }
    console.log('Verificadas ' + requests + ' peticiones HTTP para 16 entidades.');
  });
};

