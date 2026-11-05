# Aerolink

Sistema empresarial de casillero virtual y logística Miami → Costa Rica. Backend Node.js/Express, persistencia MySQL con Sequelize y frontend React/Vite. Modelo de **16 entidades**: 15 operativas y Usuario. Implementa los días 1 y 2; contexto2.md sustituye la prohibición de autenticación del primer día.

## Instalar y configurar

Requisitos: Node.js 22.12+ o 24 LTS, npm y MySQL en ejecución. En PowerShell usar npm.cmd si npm.ps1 está bloqueado por la política de scripts.

Desde la raíz:

```powershell
npm install --prefix backend
npm install --prefix frontend
# Solo si NO existe backend/.env:
Copy-Item backend/.env.example backend/.env
# Edita backend/.env con tus datos MySQL y genera JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Copia el resultado a JWT_SECRET dentro de backend/.env.
npm run db:check
npm run db:sync
npm run seed
```

La configuración local ya existe; no reemplazar un .env configurado. DB_DIALECT=mysql, DB_HOST=127.0.0.1, DB_PORT=3306, DB_NAME=aerolink, DB_USER y DB_PASSWORD apuntan al servidor MySQL. JWT_SECRET debe ser una clave aleatoria de al menos 32 bytes; JWT_EXPIRES_IN=1h. CORS_ORIGIN=http://localhost:5173. La contraseña y la clave real viven únicamente en backend/.env, ignorado por Git. El archivo .env.example contiene marcadores.

Si necesitas crear la base: CREATE DATABASE aerolink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; desde Workbench. db:sync y el arranque crean tablas faltantes sin force ni alter. Se conserva la información existente; futuros cambios de columnas requieren migraciones versionadas.

## Ejecutar

Terminal 1, desde la raíz:

```powershell
npm run dev
```

Terminal 2, desde la raíz:

```powershell
npm run dev:frontend
```

Abrir **http://localhost:5173**. El backend escucha en http://localhost:3000/api. Vite redirige /api al backend para desarrollo local. Regístrate desde Crear una cuenta y luego accede al panel; el registro de la interfaz inicia sesión automáticamente. El seed carga las 15 entidades de operación, sin crear cuentas con contraseñas predeterminadas.

Otros comandos: npm start inicia backend sin recarga; npm run build:frontend compila React; npm run db:check verifica conexión/tablas. npm run preview --prefix frontend sirve el build para inspección estática; para una integración de producción hay que configurar VITE_API_URL con un backend accesible y HTTPS (el proxy de desarrollo no forma parte del build).

## Uso y autenticación

JWT HS256 dura una hora por defecto. React lo conserva **solo en memoria** mediante AuthContext y agrega Authorization: Bearer a cada petición protegida. Recargar exige volver a entrar. Un 401 borra la sesión y vuelve al login; Cerrar sesión elimina el token local. No hay refresh token automático. Al cambiar correo o contraseña, los tokens de esa cuenta dejan de ser válidos. Una cuenta eliminada tampoco puede seguir usando tokens anteriores.

La API guarda hashes bcrypt con coste 12; nunca devuelve password ni tokenVersion. Las contraseñas exigen al menos ocho caracteres y máximo 72 bytes UTF-8. El frontend no es una barrera de seguridad: el middleware comprueba cada petición. Todos los autenticados comparten acceso, incluso al CRUD de Usuario; no hay roles ni permisos por usuario, según el contexto. Login y registro tienen límite de 100 solicitudes por IP en 15 minutos. El logout local no revoca copias de un JWT; cambiar contraseña, borrar usuario o esperar su expiración las invalida.

| Endpoint | Acceso | Resultado |
|---|---|---|
| POST /api/auth/register | Público | 201 usuario sin hash; 400 correo repetido/datos inválidos |
| POST /api/auth/login | Público | 200 data.token y data.usuario; 401 credenciales incorrectas |
| GET /api/auth/me | Autenticado | Perfil público; 401 sin token válido |
| GET /api/health | Público | Solo estado de conexión |
| GET /api/resumen | Autenticado | Conteos de las 16 entidades |

Éxito: { "ok": true, "data": ... }. Listas: data es arreglo y meta contiene page, limit y total. Error: { "ok": false, "message": "...", "errors": [...] }; los rechazos del middleware incluyen además error: No autorizado. Códigos 400, 401, 404, 409, 429 y 500.

## Entidades y relaciones

Cada ruta admite POST, GET, GET /:id, PUT /:id y DELETE /:id, todas protegidas: **80 operaciones CRUD**.

| Rutas /api/ | Función |
|---|---|
| clientes, casilleros | Contactos y asignación de casillero |
| paquetes, envios | Recepción y consolidación |
| facturas | Importes, impuestos y pagos |
| paises, sucursales | Cobertura y oficinas |
| bodegas, ubicaciones | Almacenes, pasillos y estantes |
| transportistas, servicios, tarifas | Proveedores y oferta comercial |
| movimientos, entregas, incidencias | Seguimiento físico y atención |
| usuarios | Cuentas para acceder al sistema |

Listas admiten page, limit (máximo 100), q y estado; usuarios admite búsqueda y paginación, sin estado. Ejemplo: /api/paquetes?page=1&limit=10&estado=en_bodega. En facturas, estado filtra estadoPago. Las listas de entidades operativas incluyen objetos de las relaciones directas para presentar nombres. PUT acepta los campos enviados y valida el resultado completo. Los selectores del frontend cargan las entidades relacionadas; si faltan datos, se indica dónde crearlos. DELETE devuelve 409 cuando existen dependencias.

## Estructura

- backend/src/config: BD y configuración JWT.
- backend/src/models: 15 entidades operativas + usuario.js.
- backend/src/controllers: un archivo por entidad, fábrica CRUD compartida y authController.js.
- backend/src/routes: un archivo por entidad y authRoutes.js.
- backend/src/middlewares: autenticación, validaciones y errores.
- backend/src/data: ejemplos empresariales para seed.
- backend/test: integración HTTP, relaciones y autenticación.
- frontend/src/components: layout, modal y RutaProtegida.
- frontend/src/context: AuthContext con sesión en memoria.
- frontend/src/pages: Login, Registro, Dashboard y una página por entidad.
- frontend/src/services: API con Bearer y un servicio por entidad.
- frontend/src/test: pruebas de componentes y flujos React.
- docs: investigación JWT, ER, atributos, justificación, colección y listas de cumplimiento.

Los directorios antiguos de modelos, controladores y migraciones de la raíz se conservan como material previo. El servidor usa exclusivamente backend. Repositorio Git local inicializado; no se ha publicado ni hecho commit de credenciales.

## Pruebas y entregables

```powershell
npm test
npm run test:mysql
npm run test:frontend
npm run build:frontend
```

Backend: SQLite en memoria para pruebas generales, autenticación y 16 CRUD. test:mysql realiza las mismas operaciones CRUD sobre la base real con datos únicos y limpia solo sus propios registros. Frontend: 21 pruebas con Vitest/Testing Library, incluidas 16 vistas, registro, login, 401 y CRUD con confirmación. No se ha podido realizar revisión visual en navegador por falta de acceso al navegador en esta sesión.

Importar docs/Aerolink.postman_collection.json y ejecutar en orden: registra una cuenta temporal, guarda token/IDs y prueba los CRUD y errores 400/401/404/409; al final elimina sus registros y cuenta temporal. Si una ejecución se interrumpe, revisar los datos temporales y vaciar la variable run antes de repetir. Alternativa: docs/aerolink.http, ajustando token, IDs y valores únicos manualmente.

Documentación: docs/investigacion-jwt.md, docs/modelo-datos.md, docs/modelo.er.mmd, docs/justificacion.md, docs/verificacion.md, docs/verificacion-dia2.md y docs/mysql-consultas.sql.

## Límites del alcance

Movimientos no calculan inventario automáticamente, entregas no cambian el estado del envío y tarifas no recalculan cobros. No hay emisión fiscal, auditoría inmutable ni refresh tokens. El estado de cada CRUD se mantiene explícitamente. SQLite queda como alternativa/pruebas: cambiar DB_DIALECT=sqlite y DB_STORAGE=./aerolink.sqlite; los archivos antiguos no se migran automáticamente. Usar HTTPS y revisar secretos, exposición de registro público y dependencias antes de producción. La auditoría previa de npm reportó dependencias moderadas en backend; no se aplicaron degradaciones incompatibles.


## Ampliaciones v2 — fase 1

Directorio de sucursales, horarios y datos demo, agregado sin cambiar los CRUD originales. Preparación: `npm run migrate:v2` y `npm run seed:sucursales:v2`; reiniciar el backend y abrir `/v2/sucursales` en el frontend. No se necesitan claves de IA en esta fase.

Consultar [docs/v2/fase1-sucursales.md](docs/v2/fase1-sucursales.md) para endpoints, pruebas y checklist de validación. Tracking, notificaciones y chatbot se implementarán en sus fases, después de validar cada entrega.

## Ampliaciones v2 — fase 2

Seguimiento personal en `/v2/rastrear`, con etapas, movimientos, ubicación, ETA estimada, incidencias e intentos de entrega. Preparación: `npm run migrate:v2`, `npm run seed:tracking:v2` y vinculación explícita con `npm run vincular:cliente -- <usuarioId> <clienteId>`. La cuenta local elegida santiago ya está vinculada al cliente demo; puede buscar AER-DEMO-0001 a AER-DEMO-0008.

Ver [fase2-tracking.md](docs/v2/fase2-tracking.md) y [alcance-aprobado.md](docs/v2/alcance-aprobado.md). Gemini se configuró solo en backend/.env y su conexión fue comprobada con gemini-2.5-flash mediante `npm run check:gemini`. El agente, chatbot y extras aprobados se implementarán por fases; todavía no se afirma que esas funciones estén disponibles.

## Agente integrado — estado vigente

El agente ya se ejecuta en el código del backend, no depende de n8n. Al arrancar muestra `Agente Aerolink activo`. Hay campana de notificaciones, chat flotante en páginas autenticadas y menú **Centro del asistente** (`/v2/agente`).

Preparación adicional: `npm install --prefix backend`, `npm run migrate:v2` y `npm run seed:agente:v2`. Reiniciar backend con `npm start` e iniciar frontend con `npm run dev:frontend`. Entrar como santiago y preguntar «¿Dónde está mi paquete AER-DEMO-0004?».

Implementación real: `backend/src/v2/agents/asistente.js` (tool calling), `backend/src/v2/agents/notificaciones.js` (hooks y trabajador), `backend/src/v2/services/herramientas-agente.js` (lectura por cliente) y `backend/src/v2/integrations/gemini.js` (proveedor). El Centro incluye modos de resumen, facturas, servicios, ayuda, traducción y borradores; también clima, mapa, QR, CSV, PDF y calendario. No se eliminan las rutas y CRUD anteriores.

[Documentación del agente, límites y pruebas](docs/v2/agente-integrado.md). n8n está preparado mediante webhook protegido, pero correo/WhatsApp requieren configurar sus credenciales y destinos. La API key Gemini permanece solo en backend/.env; nunca se incorpora a Vite o al navegador.
