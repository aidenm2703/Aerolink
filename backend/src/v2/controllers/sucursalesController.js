const { QueryTypes } = require('sequelize');
const { sequelize, models } = require('../../models');
const { ok, fail } = require('../../utils/responses');
const select = 'SELECT s.id, s.codigo, s.nombre, s.direccion, s.telefono, s.estado, s.paisId, s.horario, p.nombre AS paisNombre, p.codigo AS paisCodigo FROM sucursales s JOIN paises p ON p.id = s.paisId';
async function ready() { const columns = await sequelize.getQueryInterface().describeTable('sucursales'); if (!columns.horario) throw fail(503, 'Directorio pendiente de preparar: ejecuta npm run migrate:v2.'); }
exports.list = async (req, res) => {
  await ready();
  const { page = '1', limit = '12', q = '', pais = '', estado = '' } = req.query;
  if (typeof page !== 'string' || !/^[1-9]\d*$/.test(page) || Number(page) > 1000000 || typeof limit !== 'string' || !/^[1-9]\d*$/.test(limit) || Number(limit) > 100) throw fail(400, 'Paginación inválida.');
  if (typeof q !== 'string' || q.length > 100 || typeof pais !== 'string' || pais.length > 10 || typeof estado !== 'string' || (estado && !['activo','inactivo'].includes(estado))) throw fail(400, 'Filtros inválidos.');
  const where = " WHERE (s.nombre LIKE :q OR s.codigo LIKE :q OR s.direccion LIKE :q) AND (:pais = '' OR p.codigo = :pais) AND (:estado = '' OR s.estado = :estado)";
  const replacements = { q: '%' + q + '%', pais, estado, limit: Number(limit), offset: (Number(page)-1)*Number(limit) };
  const data = await sequelize.query(select + where + ' ORDER BY s.nombre ASC LIMIT :limit OFFSET :offset', { replacements, type: QueryTypes.SELECT });
  const [count] = await sequelize.query('SELECT COUNT(*) AS total FROM sucursales s JOIN paises p ON p.id=s.paisId' + where, { replacements, type: QueryTypes.SELECT });
  return ok(res, data.map(row => ({ ...row, datosDemo: row.codigo.startsWith('DEMO-') })), 200, { page: Number(page), limit: Number(limit), total: Number(count.total) });
};
exports.get = async (req, res) => {
  await ready();
  if (!/^[1-9]\d*$/.test(req.params.id) || !Number.isSafeInteger(Number(req.params.id))) throw fail(400, 'ID inválido.');
  const [branch] = await sequelize.query(select + ' WHERE s.id = :id', { replacements: { id: Number(req.params.id) }, type: QueryTypes.SELECT });
  if (!branch) throw fail(404, 'Sucursal no encontrada.');
  const warehouses = await models.bodegas.findAll({ where: { sucursalId: branch.id }, order: [['id','ASC']] });
  const bodegas = await Promise.all(warehouses.map(async warehouse => ({ ...warehouse.toJSON(), ubicaciones: await models.ubicaciones.findAll({ where: { bodegaId: warehouse.id }, order: [['id','ASC']] }) })));
  return ok(res, { ...branch, datosDemo: branch.codigo.startsWith('DEMO-'), bodegas });
};
