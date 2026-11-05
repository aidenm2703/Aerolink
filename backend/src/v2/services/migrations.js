const { DataTypes } = require('sequelize');
const migrations = [require('../../../migrations/v2/001-sucursal-horario'), require('../../../migrations/v2/002-seguimiento'), require('../../../migrations/v2/003-notificaciones')];
module.exports = async function migrate(sequelize) {
  const qi = sequelize.getQueryInterface();
  // Tabla técnica de migraciones: no se registra en los modelos de negocio ni en /api/resumen.
  await qi.createTable('_aerolink_migrations_v2', { id: { type: DataTypes.STRING, primaryKey: true }, fecha: { type: DataTypes.DATE, allowNull: false } });
  for (const migration of migrations) {
    const [rows] = await sequelize.query('SELECT id FROM _aerolink_migrations_v2 WHERE id = :id', { replacements: { id: migration.id } });
    if (rows.length) continue;
    // MySQL confirma DDL implícitamente; up es idempotente para recuperar una ejecución interrumpida.
    await migration.up(sequelize);
    await qi.bulkInsert('_aerolink_migrations_v2', [{ id: migration.id, fecha: new Date() }]);
  }
};


