import { Bot as MessageCircleIcon } from 'lucide-react';
import CampanaNotificaciones from './v2/CampanaNotificaciones';
import ChatFlotante from './v2/ChatFlotante';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, LayoutDashboard, Users, Package, Send, FileText, Inbox, MapPin, Building2, Warehouse, Grid2X2, Truck, Layers, CircleDollarSign, ArrowLeftRight, CircleCheck, CircleAlert, ShieldCheck, LogOut, Search, Menu, X, ChevronRight } from 'lucide-react';
import { entities } from '../config/entities';
import { useAuth } from '../context/AuthContext';
const icons = { clientes: Users, casilleros: Inbox, paquetes: Package, envios: Send, facturas: FileText, paises: MapPin, sucursales: Building2, bodegas: Warehouse, ubicaciones: Grid2X2, transportistas: Truck, servicios: Layers, tarifas: CircleDollarSign, movimientos: ArrowLeftRight, entregas: CircleCheck, incidencias: CircleAlert, usuarios: ShieldCheck };
const groups = [['OPERACIÓN', ['clientes','casilleros','paquetes','envios','entregas','incidencias']], ['RED LOGÍSTICA', ['paises','sucursales','bodegas','ubicaciones','transportistas','movimientos']], ['ADMINISTRACIÓN', ['servicios','tarifas','facturas','usuarios']]];
export default function Layout() {
  const { usuario, logout } = useAuth(), [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const location = useLocation();
  const path = location.pathname.split('/')[1], title = entities[path]?.title || (location.pathname === '/v2/agente' ? 'Centro del asistente' : location.pathname === '/v2/rastrear' ? 'Rastrear paquete' : path === 'v2' ? 'Directorio de sucursales' : 'Vista general');
  return <div className="app-shell"><aside className={'sidebar ' + (open ? 'is-open' : '')}><div className="brand"><span className="brand-symbol"><ArrowUpRight size={25}/></span><span>aerolink<span className="brand-dot">.</span><small>LOGÍSTICA SIN FRONTERAS</small></span><button className="mobile-only icon-button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X/></button></div>
    <div className="workspace"><span className="workspace-icon">A</span><div>Aerolink Costa Rica<small>Centro de operaciones</small></div><span className="online-dot"/></div>
    <label className="nav-search"><Search size={15}/><input aria-label="Buscar módulo" placeholder="Buscar módulo…" value={query} onChange={e => setQuery(e.target.value)}/><span>⌕</span></label>
    <nav aria-label="Navegación principal"><NavLink to="/" end onClick={() => setOpen(false)}><LayoutDashboard size={18}/>Vista general</NavLink><NavLink to="/v2/agente" onClick={()=>setOpen(false)}><MessageCircleIcon/>Centro del asistente</NavLink><NavLink to="/v2/rastrear" onClick={()=>setOpen(false)}><Search size={18}/>Rastrear paquete</NavLink><NavLink to="/v2/sucursales" onClick={()=>setOpen(false)}><Building2 size={18}/>Directorio de sucursales</NavLink>{groups.map(([group,names]) => <div className="nav-group" key={group}><p>{group}</p>{names.filter(n=>entities[n].title.toLowerCase().includes(query.toLowerCase())).map(name=>{const Icon=icons[name];return <NavLink key={name} to={'/'+name} onClick={()=>setOpen(false)}><Icon size={17}/>{entities[name].title}{name==='paquetes'&&<span className="nav-tag">Tracking</span>}</NavLink>;})}</div>)}</nav>
    <div className="sidebar-footer"><span className="avatar">{usuario?.nombre?.slice(0,1).toUpperCase()}</span><div><strong>{usuario?.nombre}</strong><small>Sesión de trabajo</small></div><button className="icon-button" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={()=>logout()}><LogOut size={18}/></button></div>
  </aside>{open&&<button className="sidebar-overlay" aria-label="Cerrar menú" onClick={()=>setOpen(false)}/>}
  <div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="mobile-only icon-button" aria-label="Abrir menú" onClick={()=>setOpen(true)}><Menu/></button><span>Espacio de trabajo</span><ChevronRight size={14}/><strong>{title}</strong></div><div className="topbar-right"><CampanaNotificaciones/><span className="environment"><span className="online-dot"/>Operación local</span><span className="avatar small">{usuario?.nombre?.slice(0,1).toUpperCase()}</span></div></header><main><Outlet/></main><footer className="main-footer"><span>© {new Date().getFullYear()} Aerolink</span><span>De Miami a Costa Rica. Todo conectado.</span></footer></div><ChatFlotante/></div>;
}



