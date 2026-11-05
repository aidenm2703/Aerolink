const { fail } = require('../utils/responses');
module.exports = (body, partial = false) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'Envía un objeto JSON.');
  for (const key of Object.keys(body)) if (!['nombre', 'correo', 'password'].includes(key)) throw fail(400, 'Campo no permitido: ' + key);
  for (const key of ['nombre', 'correo', 'password']) if (!partial || Object.hasOwn(body, key)) {
    const value = body[key];
    if (typeof value !== 'string' || !value.trim()) throw fail(400, 'Campo obligatorio: ' + key);
    if (key !== 'password' && (value.length > 255 || value !== value.trim())) throw fail(400, 'Texto inválido: ' + key);
    if (key === 'password' && (value.length < 8 || Buffer.byteLength(value, 'utf8') > 72)) throw fail(400, 'La contraseña requiere al menos 8 caracteres y máximo 72 bytes.');
    if (key === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw fail(400, 'Correo inválido.');
  }
  return { ...body, ...(body.correo ? { correo: body.correo.toLowerCase() } : {}) };
};
