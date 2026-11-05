process.env.DB_DIALECT='sqlite';process.env.DB_STORAGE=':memory:';delete process.env.DATABASE_URL;
const {test}=require('node:test');const assert=require('node:assert/strict');
const {sequelize,models}=require('../../src/models');const app=require('../../src/app');
const migrate=require('../../src/v2/services/migrations');const branchSeed=require('../../src/v2/services/seed-sucursales');const trackSeed=require('../../src/v2/services/seed-tracking');
const {Vinculo,Evento,Perfil}=require('../../src/v2/models/seguimiento');const {vincular}=require('../../src/v2/services/vinculos');const registrar=require('../../src/v2/services/registrar-evento');const {eta}=require('../../src/v2/services/eta');
test('Tracking v2: privacidad, ocho etapas, ETA, legacy sin hora y seed idempotente',async()=>{
 await sequelize.sync();await migrate(sequelize);await branchSeed(sequelize,models);const demo=await trackSeed();
 const counts=await Promise.all([models.paquetes.count(),models.movimientos.count(),Evento.count(),Perfil.count()]);await trackSeed();assert.deepEqual(await Promise.all([models.paquetes.count(),models.movimientos.count(),Evento.count(),Perfil.count()]),counts);
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port+'/api';let token;
 async function req(path,status,method='GET',body){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});const json=await r.json();assert.equal(r.status,status,JSON.stringify(json));return json.data;}
 try{
  await req('/v2/tracking/AER-DEMO-0001',401);
  const credentials={nombre:'Usuario de seguimiento',correo:'tracking-test@example.com',password:'Prueba-segura-2026'};
  const user=await req('/auth/register',201,'POST',credentials);token=(await req('/auth/login',200,'POST',credentials)).token;
  await req('/v2/tracking/AER-DEMO-0001',403);await vincular(user.id,demo.clienteId);
  const other=await models.clientes.create({nombre:'Otro cliente',apellidos:'Prueba',correo:'otro-tracking@example.com',telefono:'0000',identificacion:'ID-OTRO',direccion:'Otra dirección',fechaRegistro:'2026-11-05',estado:'activo'});
  await assert.rejects(()=>vincular(user.id,other.id),e=>e.status===409);
  const box=await models.casilleros.create({numero:'PRIVADO',direccionMiami:'Miami',fechaApertura:'2026-11-05',estado:'activo',clienteId:other.id});
  await models.paquetes.create({tracking:'NO-ES-MIO',tiendaOrigen:'Tienda',descripcion:'Privado',pesoKg:1,valorDeclaradoUsd:1,fechaRecepcion:'2026-11-05',estado:'recibido',casilleroId:box.id});
  await req('/v2/tracking/NO-ES-MIO',404);await req('/v2/tracking/NO-EXISTE',404);
  const stages=['recibido_miami','consolidado','en_transito','en_aduana','liberado','en_sucursal','en_reparto','entregado'];
  for(let i=0;i<8;i++){
   const data=await req('/v2/tracking/'+demo.trackings[i],200);assert.equal(data.etapaActual,stages[i]);assert.equal(data.progreso.indice,i);assert.equal(data.lineaTiempo.length,i+1);assert.ok(data.lineaTiempo.every(e=>e.horaRegistrada));assert.ok(data.sucursalDestino);
   if(i===3){assert.equal(data.eta.demoraIncidencias,2);assert.equal(data.ubicacionActual,null);assert.equal(data.incidencias.length,1);}
   if(i===6)assert.equal(data.entregas.length,1);
   if(i===7){assert.equal(data.eta.entregado,true);assert.equal(data.eta.desde,null);}
  }
  const first=await req('/v2/tracking/'+demo.trackings[0],200);
  const legacy=await models.movimientos.create({codigo:'LEGACY-SIN-HORA',fecha:'2026-11-06',tipo:'traslado',observaciones:'Evento sin hora histórica',estado:'registrado',paqueteId:first.paquete.id,ubicacionId:first.lineaTiempo[0].ubicacion.id});
  assert.equal((await req('/v2/tracking/'+demo.trackings[0],200)).lineaTiempo.find(e=>e.movimientoId===legacy.id).horaRegistrada,false);
  await legacy.update({estado:'anulado'});assert.equal((await req('/v2/tracking/'+demo.trackings[0],200)).lineaTiempo.some(e=>e.movimientoId===legacy.id),false);
  await assert.rejects(()=>registrar({codigo:'BAD',paqueteId:first.paquete.id,movimientoId:null,etapa:'inventado',fechaHora:'2026-11-05T15:00:00Z',detalle:'Prueba'}),e=>e.status===400);
  const old=first.lineaTiempo[0].movimientoId;
  await models.movimientos.destroy({where:{id:old}}); // Las referencias v2 no introducen bloqueos de borrado nuevos.
  assert.equal((await req('/v2/tracking/'+demo.trackings[0],200)).lineaTiempo.some(e=>e.movimientoId===old),false);
  assert.equal(Object.keys(await req('/resumen',200)).length,16);
  await Vinculo.destroy({where:{usuarioId:user.id}});await req('/v2/tracking/'+demo.trackings[0],403);
 }finally{await new Promise(r=>server.close(r));await sequelize.close();}
});
test('Regla ETA reproducible: etapa, servicio, transportista e incidencias',()=>{
 const base={etapa:'en_aduana',fechaBase:'2026-11-05T15:00:00Z',ahora:new Date('2026-11-05T15:00:00Z')};
 assert.deepEqual(eta(base).diasCalendario,[2,5]);assert.deepEqual(eta({...base,servicio:{codigo:'SER-EXP'}}).diasCalendario,[1,4]);
 const adjusted=eta({...base,transportista:{codigo:'DEMO-TRA-CONSOLIDADO'},incidencias:[{estado:'abierta',prioridad:'alta'},{estado:'resuelta',prioridad:'alta'}]});assert.deepEqual(adjusted.diasCalendario,[6,9]);assert.equal(adjusted.desde,'2026-11-11');
 assert.equal(eta({etapa:null,fechaBase:base.fechaBase}).desde,null);
});
