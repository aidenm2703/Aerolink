process.env.DB_DIALECT='sqlite';process.env.DB_STORAGE=':memory:';delete process.env.DATABASE_URL;
const {test}=require('node:test');const assert=require('node:assert/strict');
const {sequelize,models}=require('../../src/models');const app=require('../../src/app');
const migrate=require('../../src/v2/services/migrations');const seed=require('../../src/v2/services/seed-sucursales');
test('Fase 1 aditiva: migración, seed, directorio y compatibilidad del CRUD original',async()=>{
 await sequelize.sync();
 const country=await models.paises.create({codigo:'CR',nombre:'Costa Rica',estado:'activo'});
 const original=await models.sucursales.create({codigo:'SUC-SJO',nombre:'Sucursal original sin modificaciones',direccion:'Dirección original',telefono:'88880000',estado:'activo',paisId:country.id});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port+'/api';let token;
 async function req(path,expected,options={}){const r=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})}});const json=await r.json();assert.equal(r.status,expected,JSON.stringify(json));return json;}
 try{
  await req('/v2/sucursales',401);
  await req('/auth/register',201,{method:'POST',body:JSON.stringify({nombre:'Pruebas v2',correo:'v2@example.com',password:'Prueba-segura-2026'})});
  token=(await req('/auth/login',200,{method:'POST',body:JSON.stringify({correo:'v2@example.com',password:'Prueba-segura-2026'})})).data.token;
  const legacyBefore=(await req('/sucursales/'+original.id,200)).data;
  await migrate(sequelize);await migrate(sequelize);
  assert.equal((await sequelize.query('SELECT * FROM _aerolink_migrations_v2'))[0].filter(row=>row.id==='001-sucursal-horario').length,1);
  const first=await seed(sequelize,models);assert.equal(first.created.length,10);
  const beforeCounts=await Promise.all([models.sucursales.count(),models.bodegas.count(),models.ubicaciones.count()]);
  const second=await seed(sequelize,models);assert.equal(second.created.length,0);
  assert.deepEqual(await Promise.all([models.sucursales.count(),models.bodegas.count(),models.ubicaciones.count()]),beforeCounts);
  assert.deepEqual((await req('/sucursales/'+original.id,200)).data,legacyBefore);
  assert.equal((await sequelize.query('SELECT horario FROM sucursales WHERE id=:id',{replacements:{id:original.id}}))[0][0].horario,null);
  const list=await req('/v2/sucursales?limit=100',200);assert.equal(list.meta.total,11);assert.equal(list.data.filter(r=>r.datosDemo).length,10);
  const miami=(await req('/v2/sucursales?pais=US',200)).data;assert.equal(miami.length,1);assert.equal(miami[0].codigo,'DEMO-US-MIA');assert.ok(miami[0].horario.includes('New_York'));
  const detail=(await req('/v2/sucursales/'+miami[0].id,200)).data;assert.equal(detail.bodegas.length,1);assert.equal(detail.bodegas[0].ubicaciones.length,1);
  await req('/sucursales/'+miami[0].id,409,{method:'DELETE'});
  await req('/v2/sucursales?estado=desconocido',400);await req('/v2/sucursales?limit=0',400);await req('/v2/sucursales/abc',400);await req('/v2/sucursales/999999',404);
  // El CRUD previo sigue rechazando columnas no incluidas en sus validaciones actuales.
  await req('/sucursales/'+original.id,400,{method:'PUT',body:JSON.stringify({horario:'No permitido en v1'})});
  await req('/sucursales/'+original.id,200,{method:'PUT',body:JSON.stringify({nombre:legacyBefore.nombre})});
  const legacyCreated=(await req('/sucursales',201,{method:'POST',body:JSON.stringify({codigo:'LEGACY-NEW',nombre:'Oficina creada con v1',direccion:'Dirección',telefono:'0000',estado:'activo',paisId:country.id})})).data;
  await req('/sucursales/'+legacyCreated.id,200,{method:'DELETE'});
  assert.equal(Object.keys((await req('/resumen',200)).data).length,16);
 }finally{await new Promise(r=>server.close(r));await sequelize.close();}
});
