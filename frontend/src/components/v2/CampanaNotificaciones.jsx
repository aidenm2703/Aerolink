import {useEffect,useState} from 'react';
import {Bell,X,Check} from 'lucide-react';
import {api} from '../../services/api';
import './agente.css';
export default function CampanaNotificaciones(){
 const[open,setOpen]=useState(false),[data,setData]=useState({noLeidas:0,notificaciones:[]}),[error,setError]=useState('');
 async function load(){try{const r=await api('/v2/notificaciones');setData(r.data||{});setError('');}catch(e){setError(e.status===403?'Vincula tu cuenta a un cliente para recibir alertas.':e.message);}}
 useEffect(()=>{let alive=true;const reload=async()=>{if(alive)await load();};reload();const timer=setInterval(reload,15000);return()=>{alive=false;clearInterval(timer);};},[]);
 async function mark(id){try{await api('/v2/notificaciones/'+id+'/leida',{method:'PATCH'});await load();}catch(e){setError(e.message);}}
 return <div className="agent-bell"><button className="icon-button" aria-label={'Notificaciones: '+(data.noLeidas||0)+' sin leer'} onClick={()=>setOpen(!open)}><Bell size={19}/>{data.noLeidas>0&&<span className="agent-counter">{data.noLeidas}</span>}</button>{open&&<section className="agent-notifications" aria-label="Panel de notificaciones"><header><strong>Notificaciones</strong><button className="icon-button" aria-label="Cerrar notificaciones" onClick={()=>setOpen(false)}><X size={17}/></button></header>{error&&<p role="status">{error}</p>}{!error&&!(data.notificaciones||[]).length&&<p>No hay notificaciones todavía. El agente avisará cuando se registren eventos.</p>}{(data.notificaciones||[]).map(n=><article key={n.id} className={n.leida?'read':''}><p>{n.mensaje}</p><small>{new Date(n.fecha).toLocaleString('es-CR')} · {n.origenTexto==='gemini'?'Gemini':'Respaldo'}</small>{!n.leida&&<button className="icon-button" aria-label={'Marcar notificación '+n.id+' como leída'} onClick={()=>mark(n.id)}><Check size={14}/></button>}</article>)}</section>}</div>;
}
