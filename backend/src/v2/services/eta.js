const etapas=[['recibido_miami','Recibido en Miami'],['consolidado','Consolidado'],['en_transito','En tránsito'],['en_aduana','En aduana'],['liberado','Liberado'],['en_sucursal','En sucursal'],['en_reparto','En reparto'],['entregado','Entregado']];
// Días calendario RESTANTES desde la etapa, no garantías comerciales.
const rangos=[[7,12],[5,9],[4,7],[2,5],[1,3],[0,2],[0,1],[0,0]];
const ajustesServicio={'SER-EXP':-1,'DEMO-SER-ESTANDAR':1};
const ajustesTransportista={'TRA-001':0,'DEMO-TRA-CONSOLIDADO':1};
function eta({etapa,fechaBase,incidencias=[],servicio,transportista,ahora=new Date()}){
 if(etapa==='entregado')return{estimado:true,entregado:true,desde:null,hasta:null,nota:'Paquete registrado como entregado; no requiere ETA.'};
 const indice=etapas.findIndex(([key])=>key===etapa);
 if(indice<0||!fechaBase)return{estimado:true,desde:null,hasta:null,nota:'Información insuficiente para estimar una entrega.'};
 const abiertas=incidencias.filter(i=>['abierta','en_revision'].includes(i.estado));
 const demora=abiertas.reduce((n,i)=>n+({baja:1,media:2,alta:3}[i.prioridad]||1),0);
 const ajuste=(ajustesServicio[servicio?.codigo]||0)+(ajustesTransportista[transportista?.codigo]||0);
 const base=new Date(fechaBase);if(!Number.isFinite(base.getTime()))return{estimado:true,desde:null,hasta:null,nota:'Fecha insuficiente para estimar.'};
 const dias=rangos[indice].map(n=>Math.max(0,n+ajuste)+demora);
 const fechas=dias.map(n=>{const d=new Date(base);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);});
 return{estimado:true,desde:fechas[0],hasta:fechas[1],diasCalendario:dias,ajusteServicio:ajustesServicio[servicio?.codigo]||0,ajusteTransportista:ajustesTransportista[transportista?.codigo]||0,demoraIncidencias:demora,fueraDeRango:fechas[1]<ahora.toISOString().slice(0,10),nota:'Estimación desde el último evento fechado. No confirma una entrega ni calcula impuestos aduaneros.'};
}
module.exports={etapas,eta};

