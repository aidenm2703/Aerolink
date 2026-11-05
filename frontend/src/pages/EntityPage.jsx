import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Package, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { entities } from '../config/entities';
import { allRecords, entityService } from '../services/api';
import Modal from '../components/Modal';
const readable = value => String(value ?? '—').replaceAll('_', ' ');
function recordLabel(row) { return [row.codigo || row.numero || row.tracking, row.nombre || row.destinatario || row.descripcion || row.correo].filter(Boolean).join(' · ') || '#' + row.id; }

export default function EntityPage({ entity, service: suppliedService }) {
  const config = entities[entity], service = useMemo(() => suppliedService || entityService(entity), [entity, suppliedService]);
  const [rows, setRows] = useState([]), [meta, setMeta] = useState({ total: 0 }), [page, setPage] = useState(1), [query, setQuery] = useState(''), [search, setSearch] = useState(''), [state, setState] = useState('');
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null), [deleting, setDeleting] = useState(null), [values, setValues] = useState({}), [formError, setFormError] = useState(''), [busy, setBusy] = useState(false), [options, setOptions] = useState({}), [optionsLoading, setOptionsLoading] = useState(false);
  const stateField = config.fields.find(f => ['estado', 'estadoPago'].includes(f.key));
  const columns = config.fields.filter(f => f.type !== 'password').slice(0, 5);
  if (stateField && !columns.includes(stateField)) columns.push(stateField);
  useEffect(() => { const timer = setTimeout(() => { setSearch(query); setPage(1); }, 300); return () => clearTimeout(timer); }, [query]);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const result = await service.list({ page, limit: 10, ...(search ? { q: search } : {}), ...(state ? { estado: state } : {}) }); setRows(result.data); setMeta(result.meta); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [service, page, search, state]);
  useEffect(() => { let cancelled = false; setLoading(true); setError(''); service.list({ page, limit: 10, ...(search ? { q: search } : {}), ...(state ? { estado: state } : {}) }).then(r => { if (!cancelled) { setRows(r.data); setMeta(r.meta); } }).catch(e => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [service, page, search, state]);
  async function openForm(row) {
    setEditing(row || {}); setFormError(''); setOptions({});
    setValues(Object.fromEntries(config.fields.map(f => [f.key, f.type === 'password' ? '' : row?.[f.key] ?? (f.type === 'date' ? [new Date().getFullYear(), String(new Date().getMonth() + 1).padStart(2, '0'), String(new Date().getDate()).padStart(2, '0')].join('-') : '')])));
    setOptionsLoading(true);
    try { const references = [...new Set(config.fields.map(f => f.reference).filter(Boolean))]; const result = await Promise.all(references.map(async name => [name, await allRecords(name)])); setOptions(Object.fromEntries(result)); }
    catch (e) { setFormError('No se pudieron cargar las relaciones: ' + e.message); }
    finally { setOptionsLoading(false); }
  }
  async function save(e) {
    e.preventDefault(); setBusy(true); setFormError('');
    try {
      const body = {};
      for (const field of config.fields) {
        const value = values[field.key];
        if (field.type === 'password' && editing.id && !value) continue;
        body[field.key] = value === '' && !field.required ? null : ['number', 'relation'].includes(field.type) ? Number(value) : value;
      }
      if (editing.id) await service.update(editing.id, body); else await service.create(body);
      setEditing(null); setNotice(editing.id ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.'); await load();
    } catch (e) { setFormError(e.message); } finally { setBusy(false); }
  }
  async function remove() { setBusy(true); setFormError(''); try { await service.remove(deleting.id); setDeleting(null); setNotice('Registro eliminado correctamente.'); if (rows.length === 1 && page > 1) setPage(page - 1); else await load(); } catch (e) { setFormError(e.message); } finally { setBusy(false); } }
  function cell(row, field) {
    const value = row[field.key];
    if (field.type === 'select' && ['estado','estadoPago','prioridad'].includes(field.key)) return <span className={'badge ' + value}>{readable(value)}</span>;
    if (field.type === 'relation') { const parent = Object.values(row).find(v => v && typeof v === 'object' && v.id === value && (v.nombre || v.codigo || v.numero || v.tracking)); return parent ? recordLabel(parent) : '#' + value; }
    if (value === null) return 'Sin asignar';
    if (field.type === 'number') return Number(value).toLocaleString('es-CR', { maximumFractionDigits: field.key === 'pesoKg' ? 3 : 2 });
    return readable(value);
  }
  return <>
    <div className="page-heading"><div><span className="eyebrow">GESTIÓN DE LA OPERACIÓN</span><h1>{config.title}<span className="text-teal">.</span></h1><p>Consulta, organiza y mantén al día tus registros de {config.title.toLowerCase()}.</p></div><button className="button primary" onClick={() => openForm(null)}><Plus size={18}/>Nuevo registro</button></div>
    {notice && <div className="alert success" role="status">{notice}<button className="icon-button" aria-label="Cerrar aviso" onClick={() => setNotice('')}><X size={16}/></button></div>}
    {error && <div className="alert error" role="alert">{error}<button onClick={load}>Reintentar</button></div>}
    <section className="panel entity-panel"><div className="entity-toolbar"><div className="entity-count"><h2>Todos los registros</h2><span>{meta.total}</span></div><div className="filters"><label className="search-field"><Search size={17}/><input aria-label="Buscar registros" placeholder="Buscar en los registros…" value={query} onChange={e => setQuery(e.target.value)}/></label>{stateField && <select aria-label="Filtrar por estado" value={state} onChange={e => { setState(e.target.value); setPage(1); }}><option value="">Todos los estados</option>{stateField.options.map(o => <option key={o} value={o}>{readable(o)}</option>)}</select>}<button className="icon-button bordered" onClick={load} disabled={loading} aria-label="Actualizar registros"><RefreshCw size={17} className={loading ? 'spin' : ''}/></button></div></div>
    <div className="table-scroll" aria-busy={loading}><table><thead><tr><th>ID</th>{columns.map(f => <th key={f.key}>{f.label}</th>)}<th className="actions-heading">ACCIONES</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><span className="id-cell">#{row.id}</span></td>{columns.map((field, i) => <td key={field.key} className={i === 0 ? 'primary-cell' : ''}>{cell(row, field)}</td>)}<td><div className="row-actions"><button className="icon-button" aria-label={'Editar registro ' + row.id} title="Editar" onClick={() => openForm(row)}><Pencil size={16}/></button><button className="icon-button danger-text" aria-label={'Eliminar registro ' + row.id} title="Eliminar" onClick={() => { setDeleting(row); setFormError(''); }}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>
    {loading && <div className="loading-state" role="status"><RefreshCw size={16} className="spin"/>Cargando registros…</div>}
    {!loading && !rows.length && <div className="empty-state"><Package size={32}/><h3>{query || state ? 'No encontramos resultados' : 'Este espacio está listo para empezar'}</h3><p>{query || state ? 'Prueba otra búsqueda o cambia los filtros.' : 'Crea tu primer registro para organizar tu operación.'}</p>{!query && !state && <button className="button secondary" onClick={() => openForm(null)}><Plus size={16}/>Nuevo registro</button>}</div>}
    <footer className="table-footer"><span>{meta.total ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, meta.total)} de {meta.total} registros</span><div><button className="icon-button bordered" disabled={page <= 1 || loading} aria-label="Página anterior" onClick={() => setPage(page - 1)}><ChevronLeft size={17}/></button><span>Página {page} de {Math.max(1, Math.ceil(meta.total / 10))}</span><button className="icon-button bordered" disabled={page * 10 >= meta.total || loading} aria-label="Página siguiente" onClick={() => setPage(page + 1)}><ChevronRight size={17}/></button></div></footer></section>
    <div className="page-note">Los cambios se guardan en la base de datos de Aerolink. Los registros con dependencias están protegidos contra eliminación.</div>
    {editing && <Modal title={(editing.id ? 'Editar' : 'Crear') + ' · ' + config.title} onClose={() => setEditing(null)} busy={busy}><form onSubmit={save}><div className="modal-body">{formError && <div className="alert error" role="alert">{formError}</div>}{optionsLoading && <div className="alert" role="status">Cargando opciones relacionadas…</div>}<div className="form-grid">{config.fields.map(field => <label key={field.key}>{field.label}{field.required && !(field.type === 'password' && editing.id) && <span className="required"> *</span>}{field.type === 'relation' || field.type === 'select' ? <select required={field.required} value={values[field.key] ?? ''} onChange={e => setValues({ ...values, [field.key]: e.target.value })} disabled={optionsLoading}><option value="">{field.required ? 'Seleccionar…' : 'Sin asignar'}</option>{field.reference ? (options[field.reference] || []).map(row => <option key={row.id} value={row.id}>{recordLabel(row)} · #{row.id}</option>) : field.options.map(o => <option key={o} value={o}>{readable(o)}</option>)}</select> : <input type={field.type} required={field.required && !(field.type === 'password' && editing.id)} value={values[field.key] ?? ''} onChange={e => setValues({ ...values, [field.key]: e.target.value })} step={field.step} min={field.min} minLength={field.type === 'password' ? 8 : undefined} maxLength={field.type === 'text' || field.type === 'email' ? 255 : undefined} autoComplete={field.type === 'password' ? 'new-password' : 'off'}/>} {field.type === 'password' && <small>{editing.id ? 'Dejar vacía para conservar la contraseña.' : 'Mínimo 8 caracteres; máximo 72 bytes.'}</small>}{field.reference && !optionsLoading && !(options[field.reference] || []).length && <small>Primero crea un registro en <Link to={'/' + field.reference}>{entities[field.reference].title}</Link>.</small>}</label>)}</div></div><div className="modal-footer"><button type="button" className="button secondary" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button><button className="button primary" disabled={busy || optionsLoading}>{busy ? 'Guardando…' : 'Guardar registro'}</button></div></form></Modal>}
    {deleting && <Modal title="Confirmar eliminación" onClose={() => setDeleting(null)} busy={busy}><div className="modal-body"><span className="delete-icon"><AlertTriangle size={26}/></span><h3>¿Eliminar el registro #{deleting.id}?</h3><p>Esta acción es permanente. Si otros registros dependen de él, Aerolink impedirá la eliminación.</p>{formError && <div className="alert error" role="alert">{formError}</div>}</div><div className="modal-footer"><button className="button secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button><button className="button danger" disabled={busy} onClick={remove}>{busy ? 'Eliminando…' : 'Sí, eliminar'}</button></div></Modal>}
  </>;
}
