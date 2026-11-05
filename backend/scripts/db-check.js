const { sequelize } = require('../src/models');
(async () => {
  try {
    await sequelize.authenticate();
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('BD conectada | dialecto: ' + sequelize.getDialect() + ' | base: ' + sequelize.config.database);
    console.log('Tablas: ' + tables.join(', '));
  } catch (error) { console.error('No se pudo conectar: ' + error.message); process.exitCode = 1; }
  finally { await sequelize.close(); }
})();
