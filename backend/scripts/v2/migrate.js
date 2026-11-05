const { sequelize } = require('../../src/models');
const migrate = require('../../src/v2/services/migrations');
(async () => { try { await sequelize.authenticate(); await migrate(sequelize); console.log('Migraciones v2 verificadas: solo adiciones, sin borrar datos.'); } catch (error) { console.error(error.message); process.exitCode = 1; } finally { await sequelize.close(); } })();
