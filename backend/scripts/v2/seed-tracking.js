const {sequelize}=require('../../src/models');
const seed=require('../../src/v2/services/seed-tracking');
(async()=>{try{const data=await seed();console.log('Tracking demo preparado para cliente ID '+data.clienteId+': '+data.trackings.join(', '));console.log('Vincular explícitamente: npm run vincular:cliente -- <usuarioId> '+data.clienteId);}catch(error){console.error(error.message);process.exitCode=1;}finally{await sequelize.close();}})();
