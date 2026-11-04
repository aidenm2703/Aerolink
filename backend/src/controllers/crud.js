const { Op } = require('sequelize');
const { sequelize, models } = require('../models');
const validate = require('../middlewares/validation');
const { ok, fail } = require('../utils/responses');
const id = raw => { if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) throw fail(400, 'ID inválido.'); return Number(raw); };
async function business(name, data, recordId, transaction) {
  for (const [key, attr] of Object.entries(models[name].rawAttributes)) {
    if (attr.references && data[key] != null) {
      const parent = models[attr.references.model];
      if (!await parent.findByPk(data[key], { transaction })) throw fail(400, 'La referencia no existe: ' + key);
    }
  }
  if (name === 'envios' && data.fechaEstimadaEntrega < data.fechaSalida) throw fail(400, 'La entrega estimada debe ser posterior o igual a la salida.');
  if (name === 'facturas' && Math.round((data.subtotal + data.impuestos) * 100) !== Math.round(data.total * 100)) throw fail(400, 'El total debe ser subtotal más impuestos.');
  if (name === 'paquetes' && data.envioId != null) {
    const casillero = await models.casilleros.findByPk(data.casilleroId, { transaction });
    const envio = await models.envios.findByPk(data.envioId, { transaction });
    if (!casillero || !envio) throw fail(400, 'Casillero o envío inexistente.');
    if (casillero.clienteId !== envio.clienteId) throw fail(400, 'El paquete y el envío deben pertenecer al mismo cliente.');
  }
  if (name === 'casilleros' && recordId) {
    const paquetes = await models.paquetes.findAll({ where: { casilleroId: recordId }, transaction });
    for (const paquete of paquetes) if (paquete.envioId) {
      const envio = await models.envios.findByPk(paquete.envioId, { transaction });
      if (envio.clienteId !== data.clienteId) throw fail(409, 'El cambio de cliente contradice los envíos de sus paquetes.');
    }
  }
  if (name === 'envios' && recordId) {
    const paquetes = await models.paquetes.findAll({ where: { envioId: recordId }, transaction });
    for (const paquete of paquetes) {
      const casillero = await models.casilleros.findByPk(paquete.casilleroId, { transaction });
      if (casillero.clienteId !== data.clienteId) throw fail(409, 'El cambio de cliente contradice los casilleros de sus paquetes.');
    }
  }
}
module.exports = name => {
  const model = models[name];
  return {
    list: async (req, res) => {
      const page = req.query.page ?? '1', limit = req.query.limit ?? '20';
      if (!/^[1-9]\d*$/.test(page) || !/^[1-9]\d*$/.test(limit) || Number(limit) > 100 || !Number.isSafeInteger(Number(page)) || Number(page) > 1000000) throw fail(400, 'Paginación inválida: page >= 1 y limit entre 1 y 100.');
      const where = {};
      if (req.query.estado !== undefined) { if (typeof req.query.estado !== 'string') throw fail(400, 'Estado inválido.'); where[name === 'facturas' ? 'estadoPago' : 'estado'] = req.query.estado; }
      if (req.query.q !== undefined) {
        if (typeof req.query.q !== 'string' || req.query.q.length > 100) throw fail(400, 'Búsqueda inválida.');
        where[Op.or] = Object.entries(model.rawAttributes).filter(([k, a]) => a.type.key === 'STRING').map(([key]) => ({ [key]: { [Op.like]: '%' + req.query.q + '%' } }));
      }
      const result = await model.findAndCountAll({ where, limit: Number(limit), offset: (Number(page) - 1) * Number(limit), order: [['id', 'ASC']] });
      return ok(res, result.rows, 200, { page: Number(page), limit: Number(limit), total: result.count });
    },
    get: async (req, res) => { const row = await model.findByPk(id(req.params.id)); if (!row) throw fail(404, 'Registro no encontrado.'); return ok(res, row); },
    save: async (req, res) => {
      validate(model, req.body);
      const updating = req.method === 'PUT';
      const result = await sequelize.transaction(async transaction => {
        const row = updating ? await model.findByPk(id(req.params.id), { transaction }) : null;
        if (updating && !row) throw fail(404, 'Registro no encontrado.');
        const data = { ...(row ? row.toJSON() : {}), ...req.body };
        for (const [key, attr] of Object.entries(model.rawAttributes)) if (key !== 'id' && attr.allowNull === false && data[key] == null) throw fail(400, 'Campo obligatorio: ' + key);
        await business(name, data, row?.id, transaction);
        return row ? row.update(req.body, { transaction }) : model.create(req.body, { transaction });
      });
      return ok(res, result, updating ? 200 : 201);
    },
    remove: async (req, res) => { const row = await model.findByPk(id(req.params.id)); if (!row) throw fail(404, 'Registro no encontrado.'); await row.destroy(); return ok(res, { id: row.id, message: 'Registro eliminado.' }); }
  };
};
