const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
const path = require('path');
const collection = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../docs/Aerolink.postman_collection.json'), 'utf8'));
const variables = new Map(collection.variable.map(v => [v.key, v.value]));
variables.set('run', Date.now() + '-' + require('crypto').randomBytes(3).toString('hex'));
const interpolate = text => text.replace(/\{\{(\w+)\}\}/g, (_, key) => { assert.ok(variables.has(key), 'Variable faltante: ' + key); return variables.get(key); });
async function run() {
 let count = 0;
 for (const folder of collection.item) for (const item of folder.item) {
   const request = item.request;
   const headers = Object.fromEntries((request.header || []).map(h => [h.key, interpolate(h.value)]));
   if (request.auth?.type !== 'noauth') headers.Authorization = 'Bearer ' + variables.get('token');
   const response = await fetch(interpolate(request.url), { method: request.method, headers, ...(request.body ? { body: interpolate(request.body.raw) } : {}) });
   const result = await response.json();
   const pm = { collectionVariables: { get: key => variables.get(key), set: (key, value) => variables.set(key, value) },
     response: { code: response.status, json: () => result, to: { have: { status: expected => assert.equal(response.status, expected, folder.name + ' / ' + item.name + ': ' + JSON.stringify(result)) } } },
     test: (name, callback) => callback(), expect: value => ({ not: { to: { have: { property: key => assert.equal(Object.hasOwn(value, key), false) } } } }) };
   for (const event of item.event || []) if (event.listen === 'test') vm.runInNewContext(event.script.exec.join('\n'), { pm }, { timeout: 1000 });
   count++;
 }
 console.log('Colección comprobada: ' + count + ' peticiones y sus aserciones, incluidas autenticación, 16 CRUD y limpieza.');
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
