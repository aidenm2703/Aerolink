process.env.DB_DIALECT='sqlite';process.env.DB_STORAGE=':memory:';delete process.env.DATABASE_URL;
const {test}=require('node:test');const assert=require('node:assert/strict');const {sequelize,models}=require('../../src/models');const app=require('../../src/app');const migrate=require('../../src/v2/services/migrations');const branchSeed=require('../../src/v2/services/seed-sucursales');const trackSeed=require('../../src/v2/services/seed-tracking');const {vincular}=require('../../src/v2/services/vinculos');const N=require('../../src/v2/models/notificacion');const agent=require('../../src/v2/agents/notificaciones');const {runAgent}=require('../../src/v2/agents/asistente');const {executeTool}=require('../../src/v2/services/herramientas-agente');const ext=require('../../src/v2/services/contexto-externo');
test('Agente integrado: hooks, transacción, respaldo, herramientas, privacidad y exportaciones',async()=>{
 await sequelize.sync();await migrate(sequelize);await branchSeed(sequelize,models);const demo=await trackSeed();
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port+'/api';let token;
 async function req(path,status,method='GET',body){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});const json=await r.json();assert.equal(r.status,status,JSON.stringify(json));return json.data;}
 try{
  await req('/v2/notificaciones',401);await req('/v2/chat',401,'POST',{mensaje:'hola'});
  const cred={nombre:'Agente test',correo:'agent-test@example.com',password:'Prueba-segura-2026'};const user=await req('/auth/register',201,'POST',cred);token=(await req('/auth/login',200,'POST',cred)).token;
  await req('/v2/notificaciones',403);await vincular(user.id,demo.clienteId);
  await assert.rejects(()=>executeTool(user.id,'consultar_facturas_cliente',{clienteId:999}),e=>e.status===400);
  await assert.rejects(()=>executeTool(user.id,'ejecutar_sql',{sql:'SELECT * FROM usuarios'}),e=>e.status===400);
  const info=await executeTool(user.id,'buscar_paquete',{tracking:'AER-DEMO-0004'});assert.equal(info.etapa,'En aduana');
  let rounds=0;const called=await runAgent(user.id,{mensaje:'Consulta mi paquete AER-DEMO-0004'},{generate:async contents=>{rounds++;if(rounds===1)return{role:'model',parts:[{functionCall:{name:'buscar_paquete',args:{tracking:'AER-DEMO-0004'}}}]};const response=contents.at(-1).parts[0].functionResponse.response;assert.equal(response.ok,true);assert.equal(response.data.etapa,'En aduana');return{role:'model',parts:[{text:'Tu paquete figura en aduana; el plazo es estimado.'}]};}});
  assert.equal(rounds,2);assert.equal(called.origen,'gemini');assert.deepEqual(called.herramientas,['buscar_paquete']);
  const fallback=await runAgent(user.id,{mensaje:'Resumen',modo:'resumen'},{generate:async()=>{throw Error('offline');}});assert.equal(fallback.origen,'respaldo');assert.ok(fallback.herramientas.includes('resumen_operacion'));
  agent.installHooks();const p=await models.paquetes.findOne({where:{tracking:'AER-DEMO-0001'}});const u=await models.ubicaciones.findOne();
  const transaction=await sequelize.transaction();await models.movimientos.create({codigo:'ROLLBACK-AGENT',fecha:'2026-11-05',tipo:'entrada',observaciones:'No debe notificar',estado:'registrado',paqueteId:p.id,ubicacionId:u.id},{transaction});await transaction.rollback();await agent.drain();assert.equal(await N.count(),0);
  const event=await req('/movimientos',201,'POST',{codigo:'AGENT-MOV',fecha:'2026-11-05',tipo:'entrada',observaciones:'Debe notificar',estado:'registrado',paqueteId:p.id,ubicacionId:u.id});await agent.drain();assert.equal(await N.count(),1);
  await agent.processQueue({llm:async()=>{throw Error('offline');},sendWebhook:false});const n=await N.findOne();assert.equal(n.origenTexto,'plantilla');assert.equal(n.estadoGeneracion,'lista');assert.ok(n.mensaje.includes(p.tracking));
  await req('/incidencias',201,'POST',{codigo:'AGENT-INC',fecha:'2026-11-05',descripcion:'Dirección incompleta',prioridad:'media',estado:'abierta',paqueteId:p.id});await agent.drain();assert.equal(await N.count(),2);
  const list=await req('/v2/notificaciones',200);assert.equal(list.noLeidas,2);await req('/v2/notificaciones/'+n.id+'/leida',200,'PATCH');assert.equal((await req('/v2/notificaciones',200)).noLeidas,1);
  const other=await models.clientes.create({nombre:'Otro',apellidos:'Cliente',correo:'other-agent@example.com',identificacion:'OTHER-AGENT',telefono:'000',direccion:'Otra',fechaRegistro:'2026-11-05',estado:'activo'});
  const foreign=await agent.enqueue({clienteId:other.id,tipo:'privado',mensaje:'No mostrar',fuenteKey:'foreign'});assert.ok(!(await req('/v2/notificaciones',200)).notificaciones.some(r=>r.id===foreign.id));await req('/v2/notificaciones/'+foreign.id+'/leida',404,'PATCH');
  const qr=await req('/v2/asistente/qr/'+p.tracking,200);assert.ok(qr.dataUrl.startsWith('data:image/png;base64,'));assert.ok(!qr.url.includes('token='));
  const pdf=await req('/v2/asistente/pdf/'+p.tracking,200);assert.equal(Buffer.from(pdf.base64,'base64').subarray(0,4).toString(),'%PDF');
  const csv=await req('/v2/asistente/exportar/paquetes',200);assert.ok(csv.contenido.includes(p.tracking));
  const cal=await req('/v2/asistente/calendario?anio=2026',200);assert.ok(cal.fechas.some(f=>f.fecha==='2026-12-25'));assert.equal(ext.ajustarFecha('2026-12-25').fecha,'2026-12-28');
  const est=await req('/v2/asistente/estimacion/'+p.tracking,200);assert.equal(est.estimado,true);await req('/v2/asistente/mapa',200);
  await req('/movimientos/'+event.id,200,'DELETE'); // Notificaciones no añaden dependencias a los borrados previos.
  assert.equal(Object.keys(await req('/resumen',200)).length,16);
 }finally{await agent.stop();await new Promise(r=>server.close(r));await sequelize.close();}
});
