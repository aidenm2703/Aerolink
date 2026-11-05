const { sequelize, models } = require('../../src/models');
const seed = require('../../src/v2/services/seed-sucursales');
(async () => { try { const result = await seed(sequelize, models); console.log('Directorio demo: ' + result.ids.length + ' sucursales verificadas, ' + result.created.length + ' nuevas. Registros existentes conservados.'); } catch(error) { console.error(error.message); process.exitCode = 1; } finally { await sequelize.close(); } })();
