const { DataTypes } = require('sequelize');
module.exports = { id: '001-sucursal-horario', async up(sequelize) {
  const qi = sequelize.getQueryInterface();
  const columns = await qi.describeTable('sucursales');
  if (!columns.horario) await qi.addColumn('sucursales', 'horario', { type: DataTypes.STRING(255), allowNull: true, defaultValue: null });
} };

