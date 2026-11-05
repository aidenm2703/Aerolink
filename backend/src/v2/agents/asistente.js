const {generate}=require('../integrations/gemini');const {definitions,executeTool}=require('../services/herramientas-agente');const {fail}=require('../../utils/responses');
const modes={resumen:{tool:'resumen_operacion',prompt:'Resume mi operación con los datos disponibles y señala pendientes.'},facturas:{tool:'consultar_facturas_cliente',prompt:'Explica mis facturas y cobros pendientes con importes registrados. No inventes cargos.'},sucursales:{tool:'listar_sucursales',prompt:'Presenta sucursales y horarios; advierte cuáles son demo.'},tarifas:{tool:'consultar_tarifas',prompt:'Explica servicios y precios de referencia sin calcular impuestos.'},ayuda:{tool:'ayuda_aerolink',prompt:'Explica brevemente cómo usar Aerolink.'}};
async function runAgent(usuarioId,{mensaje,historial=[],modo='chat'}={},options={}){
 if(typeof mensaje!=='string'||!mensaje.trim()||mensaje.length>2000)throw fail(400,'Escribe un mensaje de 1 a 2000 caracteres.');
 if(!Array.isArray(historial)||historial.length>12)throw fail(400,'Historial inválido (máximo 12 mensajes).');
 const contents=[];for(const msg of historial){if(!msg||!['user','assistant'].includes(msg.role)||typeof msg.text!=='string'||msg.text.length>4000)throw fail(400,'Historial inválido.');contents.push({role:msg.role==='assistant'?'model':'user',parts:[{text:msg.text}]});}
 contents.push({role:'user',parts:[{text:mensaje}]});const used=[];const sourceData=[];
 async function tool(name,args){try{const data=await executeTool(usuarioId,name,args);used.push(name);sourceData.push({herramienta:name,datos:data});return{ok:true,data:JSON.parse(JSON.stringify(data))};}catch(e){return{ok:false,message:e.status&&e.status<500?e.message:'No hay datos disponibles para esta consulta.'};}}
 if(modes[modo]){const m=modes[modo],result=await tool(m.tool,{});contents.at(-1).parts.push({text:'Solicitud de interfaz: '+m.prompt+' Datos consultados por el backend: '+JSON.stringify(result)});}
 if(['traduccion','incidencia'].includes(modo))contents.at(-1).parts.push({text:modo==='traduccion'?'Traduce solo el texto proporcionado entre español e inglés; no agregues hechos. Marca como borrador.':'Sugiere descripción, categoría orientativa y prioridad para una incidencia. Es un borrador: no guardes, no asegures diagnósticos y pide revisión humana.'});
 const llm=options.generate||generate;
 try{
  for(let round=0;round<4;round++){
   const content=await llm(contents,{tools:definitions});const calls=content.parts.filter(p=>p.functionCall);
   if(!calls.length){const text=content.parts.filter(p=>p.text).map(p=>p.text).join('\n').trim();if(!text)throw Error('Sin respuesta');return{respuesta:text,origen:'gemini',herramientas:[...new Set(used)],soloLectura:true};}
   if(calls.length>5)throw Error('Demasiadas herramientas');contents.push(content);const parts=[];
   for(const part of calls){const c=part.functionCall;const result=await tool(c.name,c.args||{});parts.push({functionResponse:{name:c.name,...(c.id?{id:c.id}:{}),response:result}});}
   contents.push({role:'user',parts});
  }
  throw Error('Límite de herramientas');
 }catch{
  if(sourceData.length)return{respuesta:'El proveedor de IA no respondió. Estos son los datos consultados de tu cuenta; los tiempos son estimados.\n'+sourceData.map(s=>s.herramienta+': '+JSON.stringify(s.datos)).join('\n').slice(0,6000),origen:'respaldo',herramientas:[...new Set(used)],soloLectura:true};
  return{respuesta:'No pude consultar al proveedor de IA. No voy a inventar información. Puedes usar Rastrear paquete, el directorio o registrar una incidencia. Los tiempos son estimados y no calculo impuestos aduaneros.',origen:'respaldo',herramientas:[...new Set(used)],soloLectura:true};
 }
}
module.exports={runAgent};
