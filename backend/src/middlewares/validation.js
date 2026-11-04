const { fail } = require('../utils/responses');
module.exports = (model, body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'El cuerpo debe ser un objeto JSON.');
  const attrs = model.rawAttributes;
  for (const key of Object.keys(body)) {
    if (!Object.hasOwn(attrs, key) || key === 'id') throw fail(400, 'Campo no permitido: ' + key);
    const value = body[key], attr = attrs[key], type = attr.type.key;
    if (value === null && attr.allowNull === true) continue;
    if (value === null) throw fail(400, 'Campo obligatorio: ' + key);
    if (['STRING', 'DATEONLY'].includes(type) && (typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > 255)) throw fail(400, 'Texto inválido: ' + key);
    if (['INTEGER', 'DECIMAL'].includes(type) && (typeof value !== 'number' || !Number.isFinite(value) || (type === 'INTEGER' && (!Number.isSafeInteger(value) || value < 1)))) throw fail(400, 'Número inválido: ' + key);
    if (type === 'DECIMAL' && Math.abs(value * 1000 - Math.round(value * 1000)) > 0.00001) throw fail(400, 'Máximo tres decimales: ' + key);
    if (type === 'DECIMAL' && key !== 'pesoKg' && Math.abs(value * 100 - Math.round(value * 100)) > 0.00001) throw fail(400, 'Máximo dos decimales: ' + key);
    if (type === 'DATEONLY' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw fail(400, 'Fecha inválida: ' + key);
  }
};
