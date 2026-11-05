const {models,sequelize}=require('../../models');
const {Perfil,Evento}=require('../models/seguimiento');
const {etapas}=require('./eta');
module.exports=async function seedTracking(){
 return sequelize.transaction(async transaction=>{
  const fc=async(name,key,value,fields)=>{const[row]=await models[name].findOrCreate({where:{[key]:value},defaults:{...fields,[key]:value},transaction});return row;};
  const cliente=await fc('clientes','correo','tracking-demo@example.com',{nombre:'Cliente demo de seguimiento',apellidos:'Aerolink',telefono:'+50600002000',identificacion:'DEMO-TRACK-CLIENTE',direccion:'Dirección de demostración en Costa Rica',fechaRegistro:'2026-11-05',estado:'activo'});
  const casillero=await fc('casilleros','numero','DEMO-TRACK-CAS',{direccionMiami:'Recepción demo en Miami',fechaApertura:'2026-11-05',estado:'activo',clienteId:cliente.id});
  const servicio=await fc('servicios','codigo','DEMO-SER-ESTANDAR',{nombre:'Servicio estándar demo',descripcion:'Plazo académico de demostración',estado:'activo'});
  const pais=await fc('paises','codigo','CR',{nombre:'Costa Rica',estado:'activo'});
  const transportista=await fc('transportistas','codigo','DEMO-TRA-CONSOLIDADO',{nombre:'Transportista demo de consolidación',telefono:'+50600003000',correo:'tracking-carrier@example.com',estado:'activo',paisId:pais.id});
  const destino=await models.sucursales.findOne({where:{codigo:'DEMO-CR-HER'},transaction});
  const origen=await models.sucursales.findOne({where:{codigo:'DEMO-US-MIA'},transaction});
  if(!destino||!origen)throw new Error('Ejecuta primero el seed de sucursales v2.');
  const getUb=async branch=>{const b=await models.bodegas.findOne({where:{sucursalId:branch.id},transaction});return b&&models.ubicaciones.findOne({where:{bodegaId:b.id},transaction});};
  const ubDestino=await getUb(destino),ubOrigen=await getUb(origen);if(!ubDestino||!ubOrigen)throw new Error('Faltan las ubicaciones demo v2.');
  const trackings=[];
  const base=new Date();base.setUTCHours(15,0,0,0);
  for(let actual=0;actual<etapas.length;actual++){
   const tracking='AER-DEMO-'+String(actual+1).padStart(4,'0');
   const envio=await fc('envios','codigo',tracking+'-ENV',{fechaSalida:base.toISOString().slice(0,10),fechaEstimadaEntrega:new Date(base.getTime()+12*86400000).toISOString().slice(0,10),estado:actual===7?'entregado':actual>=2?'en_transito':'pendiente',costoTotal:35,clienteId:cliente.id});
   const paquete=await fc('paquetes','tracking',tracking,{tiendaOrigen:'Tienda de demostración',descripcion:'Paquete demo: '+etapas[actual][1],pesoKg:1.5,valorDeclaradoUsd:60,fechaRecepcion:new Date(base.getTime()-actual*86400000).toISOString().slice(0,10),estado:actual===7?'entregado':actual>=2&&actual<5?'en_transito':actual>=5?'en_bodega':'recibido',casilleroId:casillero.id,envioId:envio.id});
   await Perfil.findOrCreate({where:{paqueteId:paquete.id},defaults:{paqueteId:paquete.id,servicioId:servicio.id,transportistaId:transportista.id,sucursalDestinoId:destino.id},transaction});
   for(let i=0;i<=actual;i++){
    const fechaHora=new Date(base.getTime()-(actual-i)*86400000);const codigo=tracking+'-MOV-'+i;
    const movimiento=await fc('movimientos','codigo',codigo,{fecha:fechaHora.toISOString().slice(0,10),tipo:i===0||i===5?'entrada':i===2||i===6?'salida':'traslado',observaciones:'Demo · '+etapas[i][1],estado:'registrado',paqueteId:paquete.id,ubicacionId:i>=5?ubDestino.id:ubOrigen.id});
    await Evento.findOrCreate({where:{codigo:tracking+'-EVT-'+i},defaults:{codigo:tracking+'-EVT-'+i,paqueteId:paquete.id,movimientoId:movimiento.id,etapa:etapas[i][0],fechaHora,detalle:'Evento demo: '+etapas[i][1]},transaction});
   }
   if(actual===3)await fc('incidencias','codigo',tracking+'-INC',{fecha:base.toISOString().slice(0,10),descripcion:'Demo: información del destinatario por confirmar',prioridad:'media',estado:'abierta',paqueteId:paquete.id});
   if(actual>=6)await fc('entregas','codigo',tracking+'-ENT',{fechaProgramada:base.toISOString().slice(0,10),destinatario:'Cliente demo de seguimiento',direccion:'Dirección de demostración',estado:actual===7?'entregado':'en_ruta',envioId:envio.id,sucursalId:destino.id,transportistaId:transportista.id});
   trackings.push(tracking);
  }
  return{clienteId:cliente.id,trackings};
 });
};
