const { Op } = require('sequelize');
const { models } = require('../models');
const validate = require('../middlewares/usuarioValidation');
const { fail, ok } = require('../utils/responses');
const model = models.usuarios;
function id(raw) { if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) throw fail(400, 'ID inválido.'); return Number(raw); }
exports.list = async (req, res) => {
  const page = String(req.query.page || '1'), limit = String(req.query.limit || '20');
  if (!/^[1-9]\d*$/.test(page) || Number(page) > 1000000 || !/^[1-9]\d*$/.test(limit) || Number(limit) > 100) throw fail(400, 'Paginación inválida.');
  const where = {};
  if (req.query.q !== undefined) {
    if (typeof req.query.q !== 'string' || req.query.q.length > 100) throw fail(400, 'Búsqueda inválida.');
    where[Op.or] = ['nombre', 'correo'].map(key => ({ [key]: { [Op.like]: '%' + req.query.q + '%' } }));
  }
  const result = await model.findAndCountAll({ where, limit: Number(limit), offset: (Number(page) - 1) * Number(limit), order: [['id','ASC']] });
  return ok(res, result.rows, 200, { total: result.count, page: Number(page), limit: Number(limit) });
};
exports.get = async (req,res) => { const user = await model.findByPk(id(req.params.id)); if (!user) throw fail(404, 'Usuario no encontrado.'); return ok(res,user); };
exports.save = async (req,res) => {
  const updating = req.method === 'PUT', data = validate(req.body, updating);
  if (!updating) return ok(res, await model.create(data), 201);
  const user = await model.unscoped().findByPk(id(req.params.id));
  if (!user) throw fail(404, 'Usuario no encontrado.');
  return ok(res, await user.update(data));
};
exports.remove = async (req,res) => { const user = await model.findByPk(id(req.params.id)); if (!user) throw fail(404, 'Usuario no encontrado.'); await user.destroy(); return ok(res, { id: user.id, message: 'Usuario eliminado.' }); };
