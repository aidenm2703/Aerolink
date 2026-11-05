const { sequelize } = require('../src/models');
(async () => {
  try { await sequelize.authenticate(); await sequelize.sync(); console.log('Tablas creadas/verificadas sin borrar datos.'); }
  catch (error) { console.error('No se pudo preparar la BD: ' + error.message); process.exitCode = 1; }
  finally { await sequelize.close(); }
})();
