module.exports = (err, req, res, next) => {
  let status = err.status || 500, message = err.message, errors = err.errors || [];
  if (err.name === 'SequelizeUniqueConstraintError') { status = 409; message = 'Ya existe un registro con ese valor único.'; }
  else if (err.name === 'SequelizeForeignKeyConstraintError') { status = req.method === 'DELETE' ? 409 : 400; message = req.method === 'DELETE' ? 'No se puede eliminar: existen registros dependientes.' : 'La referencia indicada no existe.'; }
  else if (err.name === 'SequelizeValidationError') { status = 400; message = 'Datos inválidos.'; }
  if (err.type === 'entity.parse.failed') { status = 400; message = 'JSON inválido.'; }
  if (status >= 500) { console.error(err); message = 'Error interno del servidor.'; errors = []; }
  res.status(status).json({ ok: false, message, errors: Array.isArray(errors) ? errors.map(e => typeof e === 'string' ? e : { field: e.path, message: e.message }) : [] });
};
