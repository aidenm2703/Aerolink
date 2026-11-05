# Alcance adicional aprobado — estado vigente

El usuario pidió integrar el agente directamente en el código. Se completaron notificaciones, chatbot y las herramientas adicionales aprobadas, manteniendo los contratos anteriores. La conexión directa con Gemini está activa; n8n es opcional para salida a otros canales.

| Funcionalidad | Estado |
|---|---|
| Sucursales, horarios, bodegas y ubicaciones demo | Implementada |
| Tracking personal, etapas, ETA e incidencias/intentos | Implementada |
| Gemini directo, clave solo backend | Implementada y probada con llamadas reales |
| Notificaciones por eventos, respaldo, campana y polling | Implementada |
| Chatbot con herramientas de lectura limitadas al cliente | Implementada y probada con tool calling real |
| Historial en memoria y accesos rápidos | Implementada; se conserva al cerrar widget, se limpia al salir/recargar |
| Ayuda de uso | Implementada en el agente |
| Explicación de cobros registrados | Implementada en el agente, sin inventar impuestos |
| Borrador de incidencia/categoría orientativa/prioridad | Implementada; revisión humana, no guardado automático |
| Traducción español/inglés | Implementada como borrador |
| Resumen personal y resumen diario | Implementados; límites indicados |
| Clima | Implementado; Open-Meteo real o indisponibilidad explícita |
| Mapa | Implementado; referencia urbana aproximada de oficinas demo |
| QR | Implementado; PNG y enlace protegido, sin credenciales |
| Recordatorio de retiro | Implementado; más de tres días en sucursal y revisión periódica |
| Aviso de retraso | Implementado; ETA estimada vencida, deduplicado por día |
| Feriados y ETA alternativa | Implementados para calendario CR 2026; no altera la ETA anterior |
| CSV | Implementado para paquetes propios, máximo 100 |
| PDF administrativo | Implementado, claramente no fiscal |
| Webhook n8n | Preparado y opcional, sin URL/secreto local |
| Envíos reales correo/WhatsApp | Requieren configurar n8n, credenciales de proveedor y destinatarios; no se han enviado |

Detalle técnico, límites, rutas y checklist: [agente-integrado.md](agente-integrado.md). Se conservan los 16 modelos públicos originales y se agregan cuatro entidades de negocio v2, total 20; las referencias nuevas no alteran restricciones de borrado anteriores. La tabla de migraciones es técnica.
