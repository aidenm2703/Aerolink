El día 2 se completan los CRUDs de todas las entidades restantes y se incorpora autenticación con
registro, inicio de sesión y rutas protegidas.
Cambio respecto al día 1: La regla «sin autenticación» del día 1 deja de aplicar. Desde hoy la API
solo permite gestionar datos a usuarios autenticados.

1 Descripción
Con el modelo de datos y el primer CRUD del día 1 como base, los estudiantes terminarán el back end
implementando las operaciones Crear, Leer, Actualizar y Eliminar en todas las entidades de su modelo.
Además, agregarán una capa de autenticación: los usuarios se registran, inician sesión y reciben un
token que el front end en React envía en cada petición a la API.
2 Objetivos del día 2
• Completar los 5 endpoints REST (crear, listar, ver uno, actualizar, eliminar) de todas las entidades
del modelo.
• Implementar las relaciones entre entidades en la API (por ejemplo, un producto que pertenece a
una categoría).
• Agregar la entidad Usuario con registro e inicio de sesión.
• Proteger las rutas de la API con un middleware que verifique el token.
• Construir en React las vistas de login y de cada entidad, consumiendo la API con el token.
3 Requisitos técnicos
• CRUDs completos: todas las entidades del modelo (mínimo 3, más Usuario) con sus 5 endpoints
funcionando y respondiendo JSON.
• Relaciones: al crear o actualizar un registro relacionado, el back end verifica que el registro
referenciado exista; si no existe, responde 400 o 404.
• Validaciones: campos obligatorios, tipos de datos y valores únicos (por ejemplo, correo de
usuario) verificados en el back end, con mensajes de error claros.
• Contraseñas: se guardan cifradas con bcrypt (o similar); nunca en texto plano ni devueltas en las
respuestas.
• Token: se emite un JWT al iniciar sesión, con tiempo de expiración (por ejemplo, 1 h u 8 h). La
clave secreta va en un archivo .env, no en el código.

Mini Proyecto 1 · Día 2 Sistema empresarial con Node.js y React

Mini Proyecto 1 · Sistema empresarial con Node.js y React Página 2
• Middleware de autenticación: revisa el encabezado Authorization: Bearer <token>; si falta o no
es válido, responde 401.
• Front end: formulario de login (y de registro), almacenamiento del token, envío del token en cada
petición y cierre de sesión.
• Fuera de alcance: roles y permisos por usuario. Basta con distinguir entre usuario autenticado y
no autenticado.
Investigación a profundidad obligatoria: aplicación del token
Antes de implementar la autenticación, cada estudiante debe realizar un deep research
(investigación a profundidad) sobre cómo aplicar el token en su proyecto. Como mínimo, la
investigación debe cubrir:
• Qué es un JWT, su estructura (header, payload, firma) y cómo se firma y verifica.
• Cómo generarlo y validarlo en Node.js con Express (por ejemplo, la librería jsonwebtoken).
• Tiempo de expiración, renovación del token (refresh token) y qué hacer cuando vence.
• Dónde guardar el token en React (localStorage, sessionStorage o cookie httpOnly) y los riesgos
de cada opción (XSS, CSRF).
• Cómo construir el middleware que protege las rutas y cómo enviar el token desde el front end.
• Buenas prácticas de seguridad: manejo de la clave secreta, qué datos no incluir en el payload y
uso de HTTPS.
El resultado se entrega en un informe breve con la explicación de lo investigado, la decisión tomada
para el proyecto y las fuentes consultadas.

4 Autenticación: entidad Usuario y endpoints
La entidad Usuario se suma al modelo de datos con estos atributos mínimos:
Atributo Tipo Regla
id entero o UUID Generado automáticamente
nombre texto Obligatorio
correo texto Obligatorio, único, formato de correo válido
password texto (hash) Obligatorio, mínimo 8 caracteres antes de cifrar
fechaCreacion fecha Generada automáticamente
Endpoints de autenticación (públicos, salvo el perfil actual, que requiere token):
Operación Método Ruta Respuesta
Registrarse POST /api/auth/register 201 con el usuario creado (sin password), o 400 si

el correo ya existe

Iniciar sesión POST /api/auth/login 200 con { token, usuario }, o 401 si las

credenciales son incorrectas

Mini Proyecto 1 · Día 2 Sistema empresarial con Node.js y React

Mini Proyecto 1 · Sistema empresarial con Node.js y React Página 3
Operación Método Ruta Respuesta
Perfil actual GET /api/auth/me 200 con el usuario del token, o 401 sin token

válido
5 Endpoints REST de las demás entidades
Cada entidad del modelo repite los 5 endpoints del día 1, ahora detrás del middleware de
autenticación. Ejemplo con Categorías:
Operación Método Ruta de ejemplo Respuesta
Crear POST /api/categorias 201 con el registro creado; 400 si falla la validación
Listar GET /api/categorias 200 con el arreglo de registros
Ver uno GET /api/categorias/:id 200, o 404 si no existe
Actualizar PUT /api/categorias/:id 200 con el registro actualizado; 404 si no existe
Eliminar DELETE /api/categorias/:id 200 o 204; 409 si otros registros dependen de él
Sin token —

Todas las rutas
anteriores 401 con { "error": "No autorizado" }

Sugerencia: Se recomienda que el listado incluya los datos del registro relacionado (por ejemplo,
el nombre de la categoría dentro de cada producto).

6 Integración en el front end
El flujo de autenticación en React sigue estos pasos:
1. El usuario llena el formulario de login; el front end envía correo y contraseña a POST
/api/auth/login.
2. Si la respuesta es 200, se guarda el token (en localStorage o en un contexto de React) y se
redirige al panel principal.
3. Cada llamada del módulo services/ agrega el encabezado Authorization: Bearer <token> (con un
interceptor de axios o una función común de fetch).
4. Las páginas de las entidades se envuelven en una ruta protegida: sin token, se redirige a /login.
5. Si la API responde 401 (token vencido o inválido), se borra el token y se vuelve al login.
6. El botón «Cerrar sesión» elimina el token y redirige al login.
Cada entidad debe tener su página con tabla o lista, formularios de crear y editar, y botón de eliminar
con confirmación. En las entidades relacionadas, el formulario usa un selector (<select>) cargado
desde la API de la entidad referenciada.

Mini Proyecto 1 · Día 2 Sistema empresarial con Node.js y React

Mini Proyecto 1 · Sistema empresarial con Node.js y React Página 4
7 Estructura de carpetas actualizada
Se mantiene la estructura del día 1 y se agregan los archivos marcados como nuevo:
mini-proyecto-1/
backend/
.env -> PUERTO, conexión a BD, JWT_SECRET [nuevo]
src/
models/ -> todas las entidades + usuario.js [nuevo]
controllers/ -> un controlador por entidad + authController [nuevo]
routes/ -> rutas por entidad + authRoutes.js [nuevo]
middlewares/ -> authMiddleware.js, validaciones [nuevo]
app.js -> configuración de Express
frontend/
src/
components/ -> formularios, tablas, RutaProtegida.jsx [nuevo]
context/ -> AuthContext.jsx: token y usuario actual [nuevo]
pages/ -> Login.jsx, Registro.jsx + una vista por entidad
services/ -> api.js con el token + un servicio por entidad
El archivo .env se agrega al .gitignore; en el repositorio se sube un .env.example sin valores reales.
8 Entregables al finalizar el día 2
✓ Informe de la investigación a profundidad sobre la aplicación del token, con las fuentes
consultadas.
✓ Diagrama entidad-relación actualizado, con la entidad Usuario incluida.
✓ Repositorio con los CRUDs completos de todas las entidades en el back end.
✓ Endpoints de registro, login y perfil funcionando, con contraseñas cifradas.
✓ Colección de Postman o Thunder Client que pruebe cada endpoint, incluidos los casos 401, 404 y
400.
✓ Front end en React con login, registro, rutas protegidas, cierre de sesión y una página por entidad.
✓ README con los pasos para instalar, configurar el .env y ejecutar el proyecto.

Mini Proyecto 1 · Día 2 Sistema empresarial con Node.js y React

Mini Proyecto 1 · Sistema empresarial con Node.js y React Página 5
9 Criterios de evaluación del día 2
Criterio Qué se revisa Peso
CRUDs completos Los 5 endpoints de todas las entidades funcionan y responden JSON

con los códigos correctos 30 %

Autenticación Registro, login con JWT, contraseñas cifradas y middleware que

protege las rutas 25 %

Front end Login, rutas protegidas y una página por entidad con formularios,

tabla y eliminar con confirmación 20 %

Relaciones y
validaciones

Las relaciones se respetan en la API y los datos se validan en el back
end 15 %

Organización y
documentación

Estructura de carpetas, .env fuera del repositorio, README y
colección de pruebas 10 %

Recordatorio: El sistema sigue siendo empresarial y el foco continúa en los CRUDs. La
autenticación protege el acceso, pero no se exigen roles ni permisos diferenciados.