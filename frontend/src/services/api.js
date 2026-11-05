let token = null;
let onUnauthorized = () => {};
export function configureSession(value, handler) { token = value; onUnauthorized = handler || (() => {}); }
export async function api(path, { method = 'GET', body, publicRequest = false, signal } = {}) {
  const response = await fetch((import.meta.env.VITE_API_URL || '/api') + path, {
    method, signal, headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(!publicRequest && token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const result = await response.json().catch(() => ({ message: 'El servidor no devolvió una respuesta válida.' }));
  if (!response.ok) {
    if (response.status === 401 && !publicRequest) onUnauthorized();
    const details = (result.errors || []).map(e => typeof e === 'string' ? e : e.message).filter(Boolean);
    const error = new Error([result.message || 'No se pudo completar la operación.', ...details].join(' '));
    error.status = response.status; throw error;
  }
  return result;
}
export const entityService = name => ({
  list: params => api('/' + name + '?' + new URLSearchParams(params)),
  get: id => api('/' + name + '/' + id),
  create: body => api('/' + name, { method: 'POST', body }),
  update: (id, body) => api('/' + name + '/' + id, { method: 'PUT', body }),
  remove: id => api('/' + name + '/' + id, { method: 'DELETE' })
});
export async function allRecords(name) {
  const rows = []; let page = 1;
  for (;;) { const result = await entityService(name).list({ page, limit: 100 }); rows.push(...result.data); if (rows.length >= result.meta.total || !result.data.length) return rows; page++; }
}
