const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { models } = require('../models');
const validate = require('../middlewares/usuarioValidation');
const config = require('../config/auth');
const { fail, ok } = require('../utils/responses');
exports.register = async (req, res) => {
  const data = validate(req.body);
  try { return ok(res, await models.usuarios.create(data), 201); }
  catch (error) { if (error.name === 'SequelizeUniqueConstraintError') throw fail(400, 'El correo ya está registrado.'); throw error; }
};
exports.login = async (req, res) => {
  const { correo, password } = req.body || {};
  if (typeof correo !== 'string' || typeof password !== 'string' || !correo || !password || correo.length > 255 || Buffer.byteLength(password) > 72) throw fail(401, 'Correo o contraseña incorrectos.');
  const user = await models.usuarios.unscoped().findOne({ where: { correo: correo.trim().toLowerCase() } });
  if (!user || !await bcrypt.compare(password, user.password)) throw fail(401, 'Correo o contraseña incorrectos.');
  const token = jwt.sign({ version: user.tokenVersion }, config.secret, { algorithm: 'HS256', subject: String(user.id), issuer: config.issuer, audience: config.audience, expiresIn: config.expiresIn });
  return ok(res, { token, usuario: user.toJSON() });
};
exports.me = (req, res) => ok(res, req.usuario.toJSON());
