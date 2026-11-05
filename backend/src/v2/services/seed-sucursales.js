const branches = require('../data/sucursales.json');
module.exports = async function seedBranches(sequelize, models) {
  const columns = await sequelize.getQueryInterface().describeTable('sucursales');
  if (!columns.horario) throw new Error('Primero ejecuta npm run migrate:v2.');
  return sequelize.transaction(async transaction => {
    const ids = [], created = [];
    const countries = {};
    for (const [codigo, nombre] of [['CR','Costa Rica'], ['US','Estados Unidos']]) {
      const [country] = await models.paises.findOrCreate({ where: { codigo }, defaults: { codigo, nombre, estado: 'activo' }, transaction });
      countries[codigo] = country.id;
    }
    for (const item of branches) {
      const { paisCodigo, horario, ...fields } = item;
      const [branch, isNew] = await models.sucursales.findOrCreate({ where: { codigo: item.codigo }, defaults: { ...fields, paisId: countries[paisCodigo], estado: 'activo' }, transaction });
      ids.push(branch.id);
      // Solo completar horario al insertar una sucursal propia nueva; nunca actualizar registros ya existentes.
      if (isNew) {
        await sequelize.query('UPDATE sucursales SET horario = :horario WHERE id = :id', { replacements: { horario, id: branch.id }, transaction });
        created.push(branch.id);
      }
      if (['DEMO-CR-HER','DEMO-CR-ALA','DEMO-US-MIA'].includes(item.codigo)) {
        const [warehouse] = await models.bodegas.findOrCreate({ where: { codigo: item.codigo + '-B01' }, defaults: { codigo: item.codigo + '-B01', nombre: 'Bodega principal · ' + item.nombre, direccion: item.direccion, estado: 'activo', sucursalId: branch.id }, transaction });
        await models.ubicaciones.findOrCreate({ where: { codigo: item.codigo + '-A01' }, defaults: { codigo: item.codigo + '-A01', pasillo: 'A', estante: '01', estado: 'disponible', bodegaId: warehouse.id }, transaction });
      }
    }
    return { ids, created };
  });
};
