import AccesoEtiqueta from './pages/v2/AccesoEtiqueta';
import CentroAgente from './pages/v2/CentroAgente';
import RastrearPaquete from './pages/v2/RastrearPaquete';
import DirectorioSucursales from './pages/v2/DirectorioSucursales';
import { Route, Routes } from 'react-router-dom';
import RutaProtegida from './components/RutaProtegida';
import Layout from './components/Layout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import { pages } from './config/pages';
export default function App() { return <Routes><Route path="/login" element={<Login/>}/><Route path="/registro" element={<Registro/>}/><Route element={<RutaProtegida/>}><Route element={<Layout/>}><Route index element={<Dashboard/>}/><Route path="/v2/sucursales" element={<DirectorioSucursales/>}/><Route path="/v2/rastrear" element={<RastrearPaquete/>}/><Route path="/v2/agente" element={<CentroAgente/>}/><Route path="/v2/etiqueta/:codigo" element={<AccesoEtiqueta/>}/>{Object.entries(pages).map(([name, Page]) => <Route key={name} path={'/' + name} element={<Page/>}/>) }<Route path="*" element={<div className="empty-state"><h1>Página no encontrada</h1><a href="/">Volver al panel</a></div>}/></Route></Route></Routes>; }



