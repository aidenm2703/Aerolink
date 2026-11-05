const {sequelize}=require('../../src/models');
const {vincular}=require('../../src/v2/services/vinculos');
(async()=>{try{const [usuarioId,clienteId]=process.argv.slice(2).map(Number);const row=await vincular(usuarioId,clienteId);console.log('Vínculo verificado: usuario '+row.usuarioId+' → cliente '+row.clienteId+'.');}catch(error){console.error(error.message);process.exitCode=1;}finally{await sequelize.close();}})();
