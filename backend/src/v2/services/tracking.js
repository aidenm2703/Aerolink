const {Op}=require('sequelize');
const {models}=require('../../models');
const {Evento,Perfil}=require('../models/seguimiento');
const {clienteAutenticado}=require('./vinculos');
const {etapas,eta}=require('./eta');
const {fail}=require('../../utils/responses');
async function ubicacionCompleta(id){
 if(!id)return null;const u=await models.ubicaciones.findByPk(id);if(!u)return null;
 const b=await models.bodegas.findByPk(u.bodegaId);const s=b?await models.sucursales.findByPk(b.sucursalId):null;
 return{...u.toJSON(),bodega:b?.toJSON()||null,sucursal:s?.toJSON()||null};
}
async function buscarPaquete(usuarioId,codigo){
 if(typeof codigo!=='string'||!codigo.trim()||codigo.length>255)throw fail(400,'Tracking inválido.');
 const clienteId=await clienteAutenticado(usuarioId);
 const casilleros=await models.casilleros.findAll({where:{clienteId},attributes:['id']});
 const paquete=await models.paquetes.findOne({where:{tracking:codigo.trim(),casilleroId:{[Op.in]:casilleros.map(c=>c.id)}}});
 if(!paquete)throw fail(404,'Paquete no encontrado para tu cuenta.');
 return{paquete,clienteId};
}
async function rastrear(usuarioId,codigo){
 const {paquete,clienteId}=await buscarPaquete(usuarioId,codigo);
 const movimientos=await models.movimientos.findAll({where:{paqueteId:paquete.id,estado:'registrado'},order:[['fecha','ASC'],['id','ASC']]});
 const validos=new Set(movimientos.map(m=>m.id));
 const eventos=(await Evento.findAll({where:{paqueteId:paquete.id},order:[['fechaHora','ASC'],['id','ASC']]})).filter(e=>!e.movimientoId||validos.has(e.movimientoId));
 const eventosPorMovimiento=new Map(eventos.filter(e=>e.movimientoId).map(e=>[e.movimientoId,e]));
 const lineaTiempo=await Promise.all(movimientos.map(async m=>{
  const e=eventosPorMovimiento.get(m.id);return{id:'mov-'+m.id,movimientoId:m.id,fecha:m.fecha,fechaHora:e?.fechaHora||null,horaRegistrada:!!e,evento:m.tipo,etapa:e?.etapa||null,detalle:e?.detalle||m.observaciones,ubicacion:await ubicacionCompleta(m.ubicacionId)};
 }));
 for(const e of eventos.filter(e=>!e.movimientoId))lineaTiempo.push({id:'evt-'+e.id,fecha:new Date(e.fechaHora).toISOString().slice(0,10),fechaHora:e.fechaHora,horaRegistrada:true,evento:'seguimiento',etapa:e.etapa,detalle:e.detalle,ubicacion:null});
 lineaTiempo.sort((a,b)=>String(a.fechaHora?new Date(a.fechaHora).toISOString():a.fecha).localeCompare(String(b.fechaHora?new Date(b.fechaHora).toISOString():b.fecha))||a.id.localeCompare(b.id));
 const ultimoEvento=eventos.at(-1);const etapa=ultimoEvento?.etapa||(['en_transito','entregado'].includes(paquete.estado)?paquete.estado:null);
 const perfil=await Perfil.findOne({where:{paqueteId:paquete.id}});
 const servicio=perfil?.servicioId?await models.servicios.findByPk(perfil.servicioId):null;
 const transportista=perfil?.transportistaId?await models.transportistas.findByPk(perfil.transportistaId):null;
 const destino=perfil?.sucursalDestinoId?await models.sucursales.findByPk(perfil.sucursalDestinoId):null;
 const envio=paquete.envioId?await models.envios.findByPk(paquete.envioId):null;
 // No exponer entregas si una modificación externa dejó un envío de otro cliente.
 const entregas=envio&&envio.clienteId===clienteId?await models.entregas.findAll({where:{envioId:envio.id},order:[['fechaProgramada','ASC'],['id','ASC']]}):[];
 const incidencias=await models.incidencias.findAll({where:{paqueteId:paquete.id},order:[['fecha','ASC'],['id','ASC']]});
 const ultimaUbicacion=lineaTiempo.filter(e=>e.ubicacion).at(-1)?.ubicacion||null;
 const fueraDeBodega=['en_transito','en_aduana','liberado','en_reparto','entregado'].includes(etapa);
 const ubicacionActual=!fueraDeBodega&&lineaTiempo.at(-1)?.evento!=='salida'?ultimaUbicacion:null;
 return{paquete:paquete.toJSON(),etapaActual:etapa,etapaNombre:etapas.find(([key])=>key===etapa)?.[1]||'Etapa detallada no registrada',progreso:{indice:etapas.findIndex(([key])=>key===etapa),etapas:etapas.map(([codigo,nombre])=>({codigo,nombre}))},lineaTiempo,ubicacionActual,ultimaUbicacionRegistrada:ultimaUbicacion,sucursalDestino:destino,servicio,transportista,eta:eta({etapa,fechaBase:ultimoEvento?.fechaHora||paquete.fechaRecepcion,incidencias,servicio,transportista}),incidencias,entregas,notaEntregas:'Los intentos corresponden al envío que contiene este paquete.'};
}
module.exports={buscarPaquete,rastrear};
