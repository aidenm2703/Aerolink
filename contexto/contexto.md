Modelado de datos empresariales e
inicio del CRUD
Sistema empresarial con CRUDs completos · Back end en Node.js · Front end en
React

Idea libre, pero empresarial. Cada estudiante elige el tema de su sistema (inventarios, empleados,
transacciones u otro), siempre que resuelva una necesidad real de una empresa. El proyecto no lleva
autenticación: no se implementa login, registro ni roles; el foco son los CRUDs.

1. Descripción
Los estudiantes deberán diseñar y construir un sistema empresarial con operaciones CRUD completas
(Crear, Leer, Actualizar y Eliminar) sobre sus entidades principales. El back end se desarrolla en Node.js
y expone una API REST; el front end se desarrolla en React y consume esa API para que el usuario
gestione la información desde la interfaz.
2. Objetivos del día 1
• Elegir el tema del sistema y justificar su utilidad para una empresa.
• Modelar los datos: identificar entidades, atributos, tipos de datos y relaciones.
• Crear la estructura base del proyecto (carpetas backend y frontend).
• Iniciar el CRUD: levantar el servidor Node.js e implementar los primeros endpoints de al menos una
entidad.
3. Ideas de sistemas empresariales
Tema Entidades sugeridas
Inventarios Productos, Categorías, Proveedores, Movimientos de stock
Empleados / RR. HH. Empleados, Departamentos, Cargos, Asistencias
Transacciones / Ventas Clientes, Facturas, Detalle de factura, Métodos de pago
Otros (libre) Activos fijos, órdenes de compra, flota de vehículos, proyectos y tareas...
4. Requisitos técnicos
• Back end: Node.js (se recomienda Express) con una API REST que responda en formato JSON.
• Front end: React, con formularios para crear y editar, una tabla o lista para consultar y un botón de
eliminar con confirmación.
• Persistencia: base de datos a elección (por ejemplo MySQL, PostgreSQL, MongoDB o SQLite).
• Modelo de datos: mínimo 3 entidades, con al menos una relación entre ellas.
• Validaciones: campos obligatorios y tipos de datos verificados en el back end.
• Sin autenticación: no se implementa login, registro, tokens ni roles.

Mini Proyecto 1 · Sistema empresarial con Node.js y React Página 2
5. Endpoints REST esperados (por entidad)
Operación Método Ruta de ejemplo Respuesta
Crear POST /api/productos 201 con el registro creado
Listar GET /api/productos 200 con el arreglo de registros
Ver uno GET /api/productos/:id 200, o 404 si no existe
Actualizar PUT /api/productos/:id 200 con el registro actualizado
Eliminar DELETE /api/productos/:id 200 o 204
6. Estructura de carpetas sugerida
mini-proyecto-1/
backend/
src/
models/ -> definición de entidades
controllers/ -> lógica de cada CRUD
routes/ -> rutas de la API
app.js -> configuración de Express
frontend/
src/
components/ -> formularios, tablas, botones
pages/ -> una vista por entidad
services/ -> llamadas a la API (fetch / axios)
7. Entregables al finalizar el día 1
• Documento breve con el tema elegido y su justificación empresarial.
• Diagrama del modelo de datos (entidad-relación) con atributos y relaciones.
• Repositorio con la estructura de backend y frontend creada.
• Servidor Node.js funcionando con al menos los endpoints de crear y listar de una entidad, probados
con Postman, Thunder Client o similar.
8. Criterios de evaluación del día 1
Criterio Qué se revisa Peso
Modelado de datos Entidades coherentes con el negocio, atributos y relaciones

correctas

35 %

Enfoque empresarial El sistema resuelve una necesidad real de una empresa 15 %
Estructura del proyecto Separación back end / front end y organización de carpetas 20 %
Inicio del CRUD Endpoints funcionando y respondiendo JSON correcto 30 %
Recordatorio: la idea del proyecto es libre, pero debe ser de tipo empresarial y enfocarse únicamente
en CRUDs completos. No se evalúa ni se debe implementar autenticación.

esta es la parte 1, la parte 2 será implementada mañana con lo estetico frontend no la implementes aun hasta que te diga