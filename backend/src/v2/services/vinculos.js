const {models}=require('../../models');
const {Vinculo}=require('../models/seguimiento');
const {fail}=require('../../utils/responses');
exports.clienteAutenticado=async usuarioId=>{
 const vinculo=await Vinculo.findOne({where:{usuarioId}});
 if(!vinculo||!await models.clientes.findByPk(vinculo.clienteId))throw fail(403,'Tu cuenta no tiene un cliente vinculado. Solicita la vinculación al administrador local.');
 return vinculo.clienteId;
};
exports.vincular=async(usuarioId,clienteId)=>{
 for(const value of [usuarioId,clienteId])if(!Number.isSafeInteger(value)||value<1)throw fail(400,'IDs inválidos.');
 if(!await models.usuarios.findByPk(usuarioId)||!await models.clientes.findByPk(clienteId))throw fail(400,'Usuario o cliente inexistente.');
 const actual=await Vinculo.findOne({where:{usuarioId}});
 if(actual&&actual.clienteId!==clienteId)throw fail(409,'La cuenta ya está vinculada a otro cliente. No se reasigna automáticamente.');
 return actual||Vinculo.create({usuarioId,clienteId});
};
