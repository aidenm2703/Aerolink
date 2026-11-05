const {models}=require('../../models');
const {Evento}=require('../models/seguimiento');
const {etapas}=require('./eta');
const {fail}=require('../../utils/responses');
module.exports=async function registrarEvento({codigo,paqueteId,movimientoId,etapa,fechaHora,detalle}){
 if(typeof codigo!=='string'||!codigo.trim()||codigo.length>255||typeof detalle!=='string'||!detalle.trim()||detalle.length>255)throw fail(400,'Código y detalle son obligatorios (máximo 255 caracteres).');
 if(!Number.isSafeInteger(paqueteId)||paqueteId<1||!await models.paquetes.findByPk(paqueteId))throw fail(400,'Paquete inválido.');
 if(!etapas.some(([key])=>key===etapa))throw fail(400,'Etapa inválida.');
 if(typeof fechaHora!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*(Z|[+-]\d{2}:\d{2})$/.test(fechaHora)||!Number.isFinite(Date.parse(fechaHora)))throw fail(400,'Fecha/hora ISO con zona horaria requerida.');
 if(movimientoId!=null){const m=Number.isSafeInteger(movimientoId)?await models.movimientos.findByPk(movimientoId):null;if(!m||m.paqueteId!==paqueteId||m.estado!=='registrado')throw fail(400,'El movimiento debe pertenecer al paquete y estar registrado.');}
 return Evento.create({codigo:codigo.trim(),paqueteId,movimientoId:movimientoId??null,etapa,fechaHora,detalle:detalle.trim()});
};
