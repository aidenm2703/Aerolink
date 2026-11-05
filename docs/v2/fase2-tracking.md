# Fase 2 — seguimiento de paquetes v2

Estado: implementada; se detiene para validación antes de notificaciones y chatbot.

## Qué se añadió

- Tablas de negocio nuevas: vinculos_usuario_cliente, perfiles_seguimiento y eventos_seguimiento. No se cambiaron columnas ni enums de los modelos v1.
- La migración 002 usa solamente creación de tablas. Las referencias a IDs v1 son lógicas y se validan en los servicios; no se añadieron FK que alteren los borrados antiguos.
- Los modelos nuevos están fuera del registro público models de v1: las rutas, el formato y las 16 claves de /api/resumen se conservan. Hay 19 entidades de negocio; Notificacion será la número 20 en la fase siguiente. La tabla de migraciones es técnica.
- GET /api/v2/tracking/:codigo requiere JWT y un vínculo verificado. Busca el tracking exclusivamente entre los casilleros del cliente vinculado. Una cuenta sin vínculo recibe 403; un paquete ajeno o inexistente recibe el mismo 404.
- Página nueva /v2/rastrear: timeline, ocho etapas, ubicación y destino, ETA, incidencias e intentos de entrega del envío que contiene el paquete.
- El historial utiliza movimientos registrados y metadatos v2 para hora y etapa. Los anulados o eliminados se excluyen. Un movimiento histórico sin hora sigue mostrándose con fecha y «hora no registrada».
- Los eventos v2 pueden representar hitos sin ubicación física conocida. La última ubicación documentada no se presenta como ubicación actual durante tránsito, aduana, liberación, reparto ni entrega. No es geolocalización en vivo.

Los estados de Paquete y Envío anteriores siguen siendo independientes. No se infiere «aduana» de un traslado genérico ni se actualizan registros v1 automáticamente. Las etapas detalladas se registran explícitamente como eventos v2.

## Etapas y ETA

| Etapa actual | Días calendario restantes, rango base |
|---|---|
| Recibido en Miami | 7–12 |
| Consolidado | 5–9 |
| En tránsito | 4–7 |
| En aduana | 2–5 |
| Liberado | 1–3 |
| En sucursal | 0–2 |
| En reparto | 0–1 |
| Entregado | No se calcula una ETA futura |

Se parte de la fecha del último evento detallado, no de la fecha de cada consulta. SER-EXP resta un día; DEMO-SER-ESTANDAR suma uno. TRA-001 suma cero y DEMO-TRA-CONSOLIDADO suma uno. Los códigos sin regla usan el rango base sin ajuste.

Cada incidencia abierta o en revisión añade 1 día si es baja, 2 si es media y 3 si es alta, a ambos extremos. Resueltas no añaden retraso. El resultado mínimo es cero días; siempre se marca estimado. Si el rango ya pasó, se informa en vez de moverlo automáticamente al futuro. Sin etapa suficiente no se inventa una ETA. Estas son reglas académicas configuradas en services/eta.js, no compromisos comerciales. La consideración de feriados está aprobada como extra para una fase posterior; esta primera regla usa días calendario.

El perfil de seguimiento guarda servicio, transportista y sucursal de destino. No altera la relación de tarifas ni calcula cobros o impuestos aduaneros.

## Comandos y demo

Desde la raíz:

```powershell
npm run migrate:v2
npm run seed:sucursales:v2
npm run seed:tracking:v2
npm run vincular:cliente -- <usuarioId> <clienteId>
npm run test:v2
```

El seed crea un cliente y casillero demo y ocho paquetes AER-DEMO-0001 a AER-DEMO-0008, uno por etapa. Resuelve las relaciones por sus códigos, es repetible y no sobrescribe filas existentes. Si se vuelve a ejecutar días después, conserva los eventos originales y sus fechas.

En la base local, por elección explícita del usuario, la cuenta santiago (usuario ID 20) se vinculó al cliente demo ID 20. No se cambió su contraseña, correo ni acceso administrativo. Puede iniciar sesión con sus credenciales anteriores y buscar los códigos demo. Otros entornos deben usar los IDs que muestre su seed; nunca asumir que los IDs coinciden.

Para registrar un evento desde una operación local autorizada:

```powershell
npm run tracking:evento -- CODIGO_EVENTO <paqueteId> <movimientoId_o_-> en_aduana 2026-11-05T15:00:00Z "Detalle del evento"
```

Un movimiento referenciado debe pertenecer al paquete y estar registrado. Código y detalle son obligatorios; la etapa debe ser conocida y fechaHora requiere zona horaria. Un guion indica que no hay movimiento físico asociado. No hay endpoint público de autoasignación de clientes.

## Gemini

Se configuró la clave proporcionada únicamente en backend/.env, excluido por Git. El frontend no recibe esa clave. No se copia a esta documentación ni a scripts de pruebas.

Variables documentadas: GEMINI_API_KEY, GEMINI_MODEL y GEMINI_TIMEOUT_MS. La conexión real respondió correctamente usando gemini-2.5-flash, que quedó seleccionado en la configuración local. El alias gemini-flash-latest produjo timeouts y 503; no se utiliza como modelo local preferido. La prueba envió solamente un mensaje técnico sin datos del proyecto.

```powershell
npm run check:gemini
```

Esta fase deja la conexión comprobada, pero todavía no implementa respuestas IA al usuario. Las llamadas del agente y chatbot se integran en sus fases. No se configuran servicios externos de correo o WhatsApp sin sus credenciales y destinos.

## Comprobaciones

- Pruebas v2: seed repetido, ocho etapas, privacidad entre clientes, 403 sin vínculo, 404 para paquetes ajenos, ETA reproducible, incidencias, movimientos anulados/eliminados y ausencia de horas inventadas.
- Las pruebas originales de backend, autenticación y 233 peticiones CRUD de MySQL siguen aprobadas.
- 26 pruebas React aprobadas: las 23 anteriores y tres del tracking. Build de producción aprobado antes de la revisión final del título de navegación, que se recompila al cerrar la fase.
- Prueba adicional contra MySQL real: ocho etapas, ETA con incidencia y aislamiento entre clientes.
- La migración 001 sigue verificándose una sola vez por su identificador; se conserva la prueba de fase 1 junto a la nueva migración.
- No se ha realizado una inspección visual en navegador; las pruebas React usan DOM simulado.

## Checklist manual

- [ ] Reiniciar el backend y abrir el frontend.
- [ ] Entrar como santiago y abrir Rastrear paquete.
- [ ] Buscar AER-DEMO-0001 y AER-DEMO-0008; comprobar que las etapas son distintas.
- [ ] Buscar AER-DEMO-0004 y comprobar incidencia y dos días extra en su ETA estimada.
- [ ] Buscar AER-DEMO-0007 y revisar el intento de entrega.
- [ ] Buscar un tracking ajeno; debe indicar que no se encontró para la cuenta.
- [ ] Confirmar que una cuenta no vinculada recibe el mensaje de vinculación pendiente.
- [ ] Confirmar que el directorio y los CRUD anteriores siguen disponibles.
- [ ] Intentar borrar un registro con dependencias y comprobar que sigue devolviendo 409.
- [ ] Validar esta fase antes de iniciar el agente de notificaciones.

### Cierre de la fase

Comprobación final completada después del ajuste de navegación: 26 pruebas React y build aprobados. El servidor local se reinició; GET /api/v2/tracking/AER-DEMO-0004 respondió 200 con la cuenta vinculada y 401 sin token. La colección anterior volvió a pasar sus 168 solicitudes. No se modificaron los contratos v1.

## Actualización posterior

El agente y las herramientas aprobadas ya se implementaron después de esta fase. El estado vigente se encuentra en [agente-integrado.md](agente-integrado.md) y [alcance-aprobado.md](alcance-aprobado.md); las menciones anteriores de funciones pendientes corresponden al cierre histórico de la fase 2.
