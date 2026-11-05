process.env.DB_DIALECT = 'sqlite'; process.env.DB_STORAGE = ':memory:'; delete process.env.DATABASE_URL;
const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { sequelize, models } = require('../src/models');
const config = require('../src/config/auth');
test('Autenticación: registro, hash, JWT, expiración, CRUD Usuario y revocación', async () => {
 await sequelize.sync();
 const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
 const base = 'http://127.0.0.1:' + server.address().port + '/api';
 async function req(method, path, body, status, token) {
   const res = await fetch(base + path, { method, headers: { 'Content-Type':'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
   const result = await res.json(); assert.equal(res.status, status, path + ': ' + JSON.stringify(result));
   assert.equal(JSON.stringify(result).includes('"password"'), false); assert.equal(JSON.stringify(result).includes('"tokenVersion"'), false);
   return result.data;
 }
 const data = { nombre:'Ana Pruebas', correo:'ana.auth@example.com', password:'Prueba-segura-2026' };
 try {
   for (const entity of Object.keys(models)) for (const [method,path,body] of [['GET','',undefined],['POST','',{}],['GET','/1',undefined],['PUT','/1',{}],['DELETE','/1',undefined]]) await req(method,'/'+entity+path,body,401);
   await req('GET','/resumen',undefined,401);
   await req('GET','/auth/me',undefined,401);
   await req('POST','/auth/register',{...data,password:'1234567'},400);
   await req('POST','/auth/register',{...data,password:'á'.repeat(37)},400);
   await req('POST','/auth/register',{...data,correo:'incorrecto'},400);
   const user = await req('POST','/auth/register',data,201);
   await req('POST','/auth/register',{...data,correo:data.correo.toUpperCase()},400);
   const stored = await models.usuarios.unscoped().findByPk(user.id);
   assert.notEqual(stored.password,data.password); assert.ok(await bcrypt.compare(data.password,stored.password));
   await req('POST','/auth/login',{correo:data.correo,password:'incorrecta'},401);
   await req('POST','/auth/login',{correo:'nadie@example.com',password:data.password},401);
   const { token } = await req('POST','/auth/login',data,200);
   const claims = jwt.verify(token,config.secret,{algorithms:['HS256']}); assert.equal(claims.exp-claims.iat,3600);
   assert.equal((await req('GET','/auth/me',undefined,200,token)).id,user.id);
   await req('GET','/clientes',undefined,401,'invalido');
   const options={subject:String(user.id),issuer:config.issuer,audience:config.audience,expiresIn:'1h'};
   for (const bad of [jwt.sign({version:0},config.secret,{...options,expiresIn:-1}),jwt.sign({version:0},'otra-clave',{...options}),jwt.sign({version:0},config.secret,{...options,algorithm:'HS384'}),jwt.sign({version:0},config.secret,{...options,audience:'otro'})]) await req('GET','/auth/me',undefined,401,bad);
   const second = await req('POST','/usuarios',{...data,correo:'crud@example.com'},201,token);
   await req('GET','/usuarios',undefined,200,token);
   await req('GET','/usuarios/'+second.id,undefined,200,token);
   await req('PUT','/usuarios/'+second.id,{nombre:'Otro nombre'},200,token);
   await req('PUT','/usuarios/'+second.id,{password:'corta'},400,token);
   for(const method of ['GET','PUT','DELETE']) await req(method,'/usuarios/999999',method==='PUT'?{nombre:'Otro'}:undefined,404,token);
   await req('PUT','/usuarios/'+user.id,{password:'Nueva-segura-2026'},200,token);
   await req('GET','/auth/me',undefined,401,token);
   const updated = (await req('POST','/auth/login',{correo:data.correo,password:'Nueva-segura-2026'},200)).token;
   await req('DELETE','/usuarios/'+second.id,undefined,200,updated);
   await req('DELETE','/usuarios/'+user.id,undefined,200,updated);
   await req('GET','/auth/me',undefined,401,updated);
 } finally { await new Promise(r=>server.close(r)); await sequelize.close(); }
});
