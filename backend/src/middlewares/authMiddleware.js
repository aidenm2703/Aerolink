const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const { models } = require('../models');
module.exports = async (req, res, next) => {
  const unauthorized = () => res.status(401).json({ ok: false, error: 'No autorizado', message: 'No autorizado', errors: [] });
  const match = /^Bearer ([^\s]+)$/.exec(req.get('Authorization') || '');
  if (!match) return unauthorized();
  let payload;
  try { payload = jwt.verify(match[1], config.secret, { algorithms: ['HS256'], issuer: config.issuer, audience: config.audience }); }
  catch { return unauthorized(); }
  if (!/^[1-9]\d*$/.test(payload.sub || '')) return unauthorized();
  try {
    const user = await models.usuarios.unscoped().findByPk(payload.sub);
    if (!user || payload.version !== user.tokenVersion) return unauthorized();
    req.usuario = user;
    next();
  } catch (error) { next(error); }
};

