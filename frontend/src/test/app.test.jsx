import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';
import EntityPage from '../pages/EntityPage';
import { entities } from '../config/entities';
import { configureSession } from '../services/api';
const response = (data, status = 200, meta) => ({ ok: status < 400, status, json: async () => ({ ok: status < 400, data, meta, ...(status >= 400 ? { message: 'No autorizado', errors: [] } : {}) }) });
const mount = path => render(<MemoryRouter initialEntries={[path]}><AuthProvider><App/></AuthProvider></MemoryRouter>);
const token = () => 'test.' + btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000) + 3600 })) + '.signature';
afterEach(() => { vi.unstubAllGlobals(); configureSession(null); });

describe('Flujo de autenticación React', () => {
 it('redirige páginas privadas al login sin token', async () => { mount('/clientes'); expect(await screen.findByRole('heading',{name:'Bienvenido de nuevo'})).toBeVisible(); });
 it('login, cabecera Bearer y cierre de sesión sin almacenamiento persistente', async () => {
  const t = token(), calls = [];
  vi.stubGlobal('fetch', vi.fn(async (url, init) => { calls.push([url,init]); if(url.endsWith('/auth/login')) return response({token:t,usuario:{id:1,nombre:'Ana',correo:'ana@example.com'}}); if(url.includes('/resumen')) return response(Object.fromEntries(Object.keys(entities).map(n=>[n,0]))); return response([],200,{total:0,page:1,limit:5}); }));
  const user=userEvent.setup(); mount('/login');
  await user.type(screen.getByLabelText('Correo electrónico'),'ana@example.com'); await user.type(screen.getByLabelText('Contraseña'),'Prueba-segura-2026'); await user.click(screen.getByRole('button',{name:'Iniciar sesión'}));
  expect(await screen.findByRole('heading',{name:/Todo listo/})).toBeVisible();
  await waitFor(()=>expect(calls.some(([url,init])=>url.endsWith('/resumen')&&init.headers.Authorization==='Bearer '+t)).toBe(true));
  expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0);
  await user.click(screen.getByRole('button',{name:'Cerrar sesión'})); expect(await screen.findByRole('heading',{name:'Bienvenido de nuevo'})).toBeVisible();
 });
 it('un 401 borra la sesión y vuelve al login', async () => {
  vi.stubGlobal('fetch',vi.fn(async url=>url.endsWith('/auth/login')?response({token:token(),usuario:{id:1,nombre:'Ana'}}):response(null,401)));
  const user=userEvent.setup(); mount('/login'); await user.type(screen.getByLabelText('Correo electrónico'),'ana@example.com'); await user.type(screen.getByLabelText('Contraseña'),'Prueba-segura-2026'); await user.click(screen.getByRole('button',{name:'Iniciar sesión'}));
  expect(await screen.findByRole('status')).toHaveTextContent('Tu sesión venció'); expect(screen.getByRole('heading',{name:'Bienvenido de nuevo'})).toBeVisible();
 });
 it('registro envía nombre, correo y contraseña y entra al panel', async()=>{
  const fetch=vi.fn(async url=>url.endsWith('/auth/register')?response({id:1,nombre:'Ana'},201):url.endsWith('/auth/login')?response({token:token(),usuario:{id:1,nombre:'Ana'}}):url.endsWith('/resumen')?response({paquetes:0}):response([],200,{total:0}));vi.stubGlobal('fetch',fetch);
  const user=userEvent.setup();mount('/registro');await user.type(screen.getByLabelText('Nombre completo'),'Ana');await user.type(screen.getByLabelText('Correo electrónico'),'ana@example.com');await user.type(screen.getByLabelText(/^Contraseña/),'Prueba-segura-2026');await user.click(screen.getByRole('button',{name:'Crear cuenta'}));expect(await screen.findByRole('heading',{name:/Todo listo/})).toBeVisible();expect(JSON.parse(fetch.mock.calls.find(([url])=>url.endsWith('/auth/register'))[1].body)).toEqual({nombre:'Ana',correo:'ana@example.com',password:'Prueba-segura-2026'});
 });
});

describe('Vistas y operaciones de entidades',()=>{
 for(const [name,config] of Object.entries(entities)) it(config.title+': tabla, formulario y selectores relacionados',async()=>{
   vi.stubGlobal('fetch',vi.fn(async()=>response([],200,{total:0,page:1,limit:100})));
   const user=userEvent.setup();render(<MemoryRouter><EntityPage entity={name}/></MemoryRouter>);
   expect(await screen.findByRole('heading',{name:config.title+'.'})).toBeVisible();await waitFor(()=>expect(screen.queryByText('Cargando registros…')).not.toBeInTheDocument());await user.click(screen.getAllByRole('button',{name:'Nuevo registro'})[0]);
   const dialog=await screen.findByRole('dialog');await waitFor(()=>expect(within(dialog).queryByText('Cargando opciones relacionadas…')).not.toBeInTheDocument());
   for(const field of config.fields){expect(within(dialog).getByLabelText(text => text.startsWith(field.label))).toBeVisible();}
   await user.click(within(dialog).getByRole('button',{name:'Cancelar'}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 });
 it('crea, edita y elimina un país con confirmación',async()=>{
  let rows=[];const calls=[];
  vi.stubGlobal('fetch',vi.fn(async(url,init)=>{calls.push([url,init]);if(init.method==='POST'){const row={...JSON.parse(init.body),id:1};rows=[row];return response(row,201);}if(init.method==='PUT'){rows=[{...JSON.parse(init.body),id:1}];return response(rows[0]);}if(init.method==='DELETE'){rows=[];return response({id:1});}return response(rows,200,{total:rows.length,page:1,limit:10});}));
  const user=userEvent.setup();render(<MemoryRouter><EntityPage entity="paises"/></MemoryRouter>);
  await waitFor(()=>expect(screen.queryByText('Cargando registros…')).not.toBeInTheDocument());await user.click(screen.getAllByRole('button',{name:'Nuevo registro'})[0]);
  let dialog=screen.getByRole('dialog');await user.type(within(dialog).getByLabelText(/Código/),'CR');await user.type(within(dialog).getByLabelText(/Nombre/),'Costa Rica');await user.selectOptions(within(dialog).getByLabelText(/Estado/),'activo');await user.click(within(dialog).getByRole('button',{name:'Guardar registro'}));expect(await screen.findByText('Costa Rica')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar registro 1'}));dialog=screen.getByRole('dialog');await user.clear(within(dialog).getByLabelText(/Nombre/));await user.type(within(dialog).getByLabelText(/Nombre/),'Costa Rica editado');await user.click(within(dialog).getByRole('button',{name:'Guardar registro'}));expect(await screen.findByText('Costa Rica editado')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Eliminar registro 1'}));expect(screen.getByRole('dialog')).toHaveTextContent('¿Eliminar el registro #1?');expect(calls.some(([,i])=>i.method==='DELETE')).toBe(false);await user.click(screen.getByRole('button',{name:'Sí, eliminar'}));await waitFor(()=>expect(screen.queryByText('Costa Rica editado')).not.toBeInTheDocument());expect(calls.some(([,i])=>i.method==='DELETE')).toBe(true);
 });
});
