const {sequelize}=require('../../src/models');
const registrar=require('../../src/v2/services/registrar-evento');
(async()=>{try{const [codigo,pid,mid,etapa,fechaHora,...detalle]=process.argv.slice(2);const row=await registrar({codigo,paqueteId:Number(pid),movimientoId:mid==='-'?null:Number(mid),etapa,fechaHora,detalle:detalle.join(' ')});console.log('Evento v2 registrado: '+row.codigo);}catch(error){console.error(error.message);process.exitCode=1;}finally{await sequelize.close();}})();
