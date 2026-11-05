# Verificación de contexto2.md — día 2

## Cambios de alcance resueltos

contexto2.md sustituye expresamente la prohibición de autenticación del día 1 y exige frontend React. El modelo tiene 16 entidades, dentro de las 15–20 solicitadas: Cliente, Casillero, Paquete, Envío, Factura, País, Sucursal, Bodega, Ubicación, Transportista, Servicio, Tarifa, Movimiento, Entrega, Incidencia y Usuario. Las tablas anteriores y sus datos no se borraron.

## Lista completa de requisitos y entregables

| Requisito | Estado | Evidencia |
|---|---|---|
| Completar cinco endpoints por entidad del modelo | Cumple | 16 CRUD, 80 operaciones JSON |
| Relaciones implementadas al crear y actualizar | Cumple | Existencia FK comprobada; 400 si no existe |
| Listados con información relacionada (sugerencia) | Extra | Include de asociaciones BelongsTo con nombres y atributos |
| Entidad Usuario agregada al modelo | Cumple | backend/src/models/usuario.js |
| Usuario: ID generado | Cumple | INTEGER PK autoincremental |
| Usuario: nombre obligatorio | Cumple | Validación de texto y NOT NULL |
| Usuario: correo obligatorio, único y válido | Cumple | Validación, minúsculas y UNIQUE |
| Usuario: contraseña de mínimo 8 caracteres antes del hash | Cumple | Mínimo 8 caracteres y máximo 72 bytes UTF-8 |
| Usuario: fechaCreacion automática | Cumple | D.NOW |
| Hash bcrypt, nunca texto plano en BD | Cumple | bcryptjs, salt automático, coste 12, pruebas de comparación |
| No devolver contraseña/hash | Cumple | Default scope, toJSON y pruebas sobre respuestas |
| JWT con expiración | Cumple | HS256, una hora por defecto, emisor y audiencia explícitos |
| Clave JWT en .env, fuera del código | Cumple | Clave aleatoria local; validación de longitud al iniciar |
| Middleware Authorization: Bearer | Cumple | authMiddleware.js, verificación de firma/algoritmo/claims/usuario |
| Falta token o token inválido: 401 | Cumple | Probado en los cinco métodos de las 16 entidades |
| Registro POST /api/auth/register público: 201 | Cumple | Respuesta data con usuario público |
| Registro con correo repetido: 400 | Cumple | Probado incluso con mayúsculas |
| Login POST /api/auth/login público: 200 token y usuario | Cumple | data.token y data.usuario, formato uniforme del proyecto |
| Login incorrecto: 401 | Cumple | Mensaje uniforme |
| GET /api/auth/me protegido: 200 / 401 | Cumple | Pruebas de perfil, caducidad y usuario eliminado |
| Cinco endpoints de otras entidades protegidos | Cumple | Middleware antes de todas las rutas CRUD y resumen |
| GET ID inexistente: 404, PUT inexistente: 404 | Cumple | Suites API, autenticación y colección |
| DELETE con dependencias: 409 | Cumple | Restricciones FK y pruebas por relación |
| JSON de no autorizado | Cumple | ok:false, error:'No autorizado', message y errors |
| Fuera de alcance: roles/permisos diferenciados | Cumple | Todos los autenticados tienen el mismo acceso |
| Investigación a profundidad antes de implementar | Cumple | docs/investigacion-jwt.md creada antes del código de autenticación |
| Investigación: JWT, header/payload/firma, firma y verificación | Cumple | Informe con RFC 7519/8725 y jsonwebtoken |
| Investigación: generar/validar en Node/Express | Cumple | Informe y código sign/verify |
| Investigación: expiración, renovación y qué hacer al vencer | Cumple | Una hora, 401 y nuevo login; refresh explicado como alternativa futura |
| Investigación: localStorage, sessionStorage, HttpOnly; XSS/CSRF | Cumple | Comparativa; elección de memoria React |
| Investigación: middleware y envío desde frontend | Cumple | Flujo Bearer documentado e implementado |
| Investigación: secreto, payload y HTTPS | Cumple | Informe y README |
| Informe breve con decisión y fuentes consultadas | Cumple | docs/investigacion-jwt.md con fuentes primarias |
| React: login y registro | Cumple | Login.jsx y Registro.jsx con validaciones/errores |
| React: guardar token y redirigir al panel | Cumple | AuthContext en memoria, redirección tras login |
| React: servicio común envía Bearer | Cumple | services/api.js |
| React: rutas protegidas y redirección a /login | Cumple | components/RutaProtegida.jsx |
| React: respuesta 401 borra token y vuelve a login | Cumple | Callback global y prueba de flujo |
| React: Cerrar sesión borra token | Cumple | Botón en Layout, prueba de flujo |
| React: página por cada entidad | Cumple | 16 páginas y rutas, incluido Usuarios |
| React: tabla/lista y crear/editar | Cumple | EntityPage reutilizable y formularios por esquema |
| React: eliminar con confirmación | Cumple | Modal explícito; DELETE solo al confirmar |
| React: selectores de FK cargados desde API | Cumple | allRecords con paginación completa de opciones |
| Estructura .env con puerto, BD y JWT_SECRET | Cumple | backend/.env y .env.example |
| Modelo usuario.js | Cumple | Archivo separado |
| Un controlador por entidad y authController | Cumple | Archivos por entidad que reutilizan fábrica CRUD |
| Rutas por entidad + authRoutes | Cumple | backend/src/routes |
| authMiddleware y validaciones | Cumple | backend/src/middlewares |
| Frontend: components, context, pages, services | Cumple | Estructura del proyecto |
| api.js y servicio por entidad | Cumple | Cada página importa su servicio dedicado |
| .env en .gitignore y ejemplo sin valores reales | Cumple | git check-ignore confirma .env; ejemplo con marcadores |
| ER actualizado con Usuario | Cumple | docs/modelo.er.mmd y modelo-datos.md |
| Repositorio con CRUDs completos | Cumple | Repositorio Git local; sin publicar |
| Endpoints de registro/login/perfil funcionales | Cumple | Pruebas API y conexión mediante proxy Vite |
| Colección Postman/Thunder con todos los endpoints y 401/404/400 | Cumple | Colección importable para 16 entidades + auth, 168 solicitudes verificadas |
| README de instalación, entorno y ejecución | Cumple | README.md y frontend/README.md |

## Evidencia ejecutada

- `npm test`: 3 suites backend aprobadas. Incluye CRUD original, 16 entidades y autenticación; 233 peticiones en la suite ampliada SQLite, además de las suites de validación y autenticación.
- `npm run test:mysql`: suite de 16 entidades aprobada, 233 peticiones HTTP con JWT real. Solo elimina sus propios registros temporales.
- `npm run test:frontend`: 21 pruebas aprobadas con Vitest y Testing Library: 16 vistas, registro, login/Bearer/logout, redirección privada, 401 y crear/editar/eliminar con confirmación.
- `npm run build:frontend`: build de producción generado por Vite.
- Prueba de conexión real a través de Vite: HTML 200; CRUD sin token 401; registro 201; login, perfil y resumen de 16 entidades 200.
- `node backend/scripts/test-collection.js`: ejecutó 168 peticiones de la colección y sus aserciones contra el servidor real. No se afirma que se abriera Postman manualmente.
- MySQL: 16 tablas sincronizadas sin force/alter. Seed conservado y repetible para 15 entidades de negocio; las cuentas se crean por registro sin contraseña predeterminada.
- `git check-ignore` confirma backend/.env, node_modules y frontend/dist excluidos.

## Evaluación del día 2

| Criterio | Peso | Evidencia |
|---|---|---|
| CRUDs completos | 30 % | 80 operaciones protegidas, probadas en MySQL/SQLite |
| Autenticación | 25 % | Registro, bcrypt, JWT, perfil, middleware y pruebas de expiración |
| Frontend | 20 % | 16 páginas con formularios, tabla, eliminación confirmada y sesión |
| Relaciones y validaciones | 15 % | FK existentes, 400/409, validaciones y selectores API |
| Organización y documentación | 10 % | Capas, contexto, README, investigación, colección y listas |

## Extras y límites explícitos

Extras: panel con conteos reales, estado de paquetes, navegación agrupada y búsqueda de módulos, paginación, filtros, mensajes de carga/error/vacío, modal con teclado/foco, diseño responsive, límite de intentos de autenticación e invalidación de tokens al cambiar credenciales.

**Revisión visual pendiente de comprobar:** se intentó acceder al navegador, pero el host de navegador y el canal nativo de Computer Use no están disponibles. Se verificaron componentes con DOM de pruebas, build y conexión HTTP; no se afirma haber verificado capturas, tamaños móviles reales ni interacción en un navegador completo.

No se implementa refresh automático; se vuelve al login al vencer. El token se pierde al recargar por diseño. Logout local no revoca una copia robada antes de su expiración; el cambio de contraseña o eliminación del usuario sí invalida tokens mediante la consulta en BD. Los usuarios autenticados comparten acceso, sin roles, como exige la práctica.

Persisten los límites empresariales anteriores: no hay cotización automática, inventario derivado, emisión fiscal ni auditoría inmutable. Usar migraciones y HTTPS antes de producción. La auditoría previa de backend reportó dependencias moderadas; no se aplicaron cambios incompatibles por fuerza.

## Última revisión del código y los CRUD

Se volvió a contrastar la implementación con contexto.md y contexto2.md y se ejecutaron las comprobaciones actuales. Se encontró una línea de texto ajena al código al final de backend/src/models/usuario.js que provocaba ReferenceError e impedía cargar los modelos. Se eliminó únicamente esa línea.

Resultados posteriores a la corrección:

- npm test: 3 suites backend aprobadas; incluye autenticación, validaciones y 233 peticiones en la suite de 16 entidades en SQLite.
- npm run test:mysql: 233 peticiones aprobadas contra MySQL real para las 16 entidades; crear, listar, consultar por ID, actualizar y eliminar, con validaciones y protección de relaciones.
- npm run db:check: conexión correcta a aerolink y 16 tablas presentes.
- npm run test:frontend: 21 pruebas React aprobadas.
- npm run build:frontend: compilación Vite aprobada.
- npm run test:collection: 168 peticiones y aserciones aprobadas contra el servidor local.
- git check-ignore backend/.env: archivo local de secretos ignorado.

Los requisitos funcionales comprobados de los días 1 y 2 se cumplen, aplicando el cambio explícito de autenticación del día 2. La revisión visual en navegador no se verificó en esta revisión; las pruebas de React usan DOM simulado. No se declara el proyecto listo para producción ni libre de errores fuera de los casos comprobados.
