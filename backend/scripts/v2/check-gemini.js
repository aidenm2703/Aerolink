require('../../src/config/database');
(async()=>{
 const key=process.env.GEMINI_API_KEY;
 if(!key){console.error('GEMINI_API_KEY no está configurada.');process.exitCode=1;return;}
 const model=process.argv[2]||process.env.GEMINI_MODEL||'gemini-flash-latest';
 try{
  const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts:[{text:'Responde únicamente OK. Es una prueba técnica sin datos personales.'}]}],generationConfig:{maxOutputTokens:32}}),signal:AbortSignal.timeout(Number(process.env.GEMINI_TIMEOUT_MS||15000))});
  const data=await response.json();
  if(!response.ok){console.error('Gemini rechazó la prueba: HTTP '+response.status+'; código '+(data.error?.status||'desconocido')+'. No se muestran credenciales ni el cuerpo del proveedor.');process.exitCode=1;return;}
  console.log('Gemini conectado: respuesta recibida del modelo '+model+'.');
 }catch{console.error('No se pudo completar la conexión con Gemini (red o tiempo de espera).');process.exitCode=1;}
})();
