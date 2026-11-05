# Verificación del día 1 — revisada al completar el día 2

Fuente: contexto/contexto.md. La instrucción posterior contexto2.md autoriza expresamente frontend y autenticación; sustituye las reglas temporales «sin autenticación» y «no implementar frontend todavía».

| Requisito del contexto original | Estado actual | Evidencia |
|---|---|---|
| Elegir tema empresarial libre y justificar utilidad real | Cumple | docs/justificacion.md: casillero virtual y envíos internacionales |
| Entidades, atributos, tipos y relaciones | Cumple | docs/modelo-datos.md y modelo.er.mmd |
| Mínimo tres entidades relacionadas | Extra | 16 entidades: 15 operativas + Usuario |
| Estructura backend y frontend | Cumple | Directorios separados y proyecto React completo |
| Node.js / Express con API REST JSON | Cumple | backend/src/app.js y rutas por entidad |
| Persistencia a elección | Cumple | MySQL aerolink con Sequelize; SQLite aislado para pruebas |
| Validar campos obligatorios y tipos en backend | Cumple | Middlewares y validaciones Sequelize |
| React con crear, editar, tabla/lista y eliminación confirmada | Cumple | 16 vistas con EntityPage compartido y Modal de confirmación |
| Sin login, registro, tokens ni roles en la parte 1 | Sustituido parcialmente por día 2 | Ahora se exige autenticación; roles siguen excluidos |
| POST por entidad: 201 con creado | Cumple | 16 entidades, pruebas HTTP |
| GET lista: 200 y arreglo | Cumple | data es arreglo con meta de paginación |
| GET ID: 200 / 404 | Cumple | Pruebas de consulta y borrado |
| PUT ID: 200 actualizado | Cumple | Pruebas de edición completa y parcial |
| DELETE ID: 200 o 204 | Cumple | 200 y 409 si existen dependencias |
| Modelos, controladores, rutas y app.js organizados | Cumple | Un archivo de controlador/ruta por entidad y CRUD común |
| Frontend components/pages/services | Cumple | Más context/AuthContext.jsx y configuración reutilizable |
| Documento empresarial breve | Cumple | docs/justificacion.md |
| Diagrama ER con atributos | Cumple | 16 entidades, FK, cardinalidades y diccionario |
| Repositorio local con estructura | Cumple | Git local, sin publicar ni añadir secretos |
| Servidor con crear/listar al menos una entidad probado | Extra | 80 operaciones CRUD y pruebas de 16 entidades |
| Criterio modelado 35 % | Cumple | Modelo coherente y decisiones justificadas |
| Criterio empresarial 15 % | Cumple | Beneficios para operaciones, bodega, atención y finanzas |
| Criterio estructura 20 % | Cumple | Backend/frontend separados y capas |
| Criterio inicio del CRUD 30 % | Extra | CRUD completos y autenticados |

## Ampliaciones del usuario conservadas

- Entre 15 y 20 entidades: **16**.
- Conexión MySQL real aerolink con credenciales en backend/.env; archivo ignorado por Git.
- Todas las rutas operativas conservadas, con autenticación añadida según día 2.
- Seed idempotente de 15 entidades operativas. Las cuentas se crean mediante registro para evitar una contraseña predeterminada.
- Health, resumen, paginación, búsqueda y filtro por estado (excepto Usuario, que no tiene estado).
- Validaciones de unicidad, FK, propiedad de paquetes, fechas, importes y total de factura.
- Errores uniformes y eliminación RESTRICT.
- Colección Postman, archivo .http, comandos db:check/db:sync y consultas Workbench.

La verificación detallada del segundo archivo y sus límites se encuentra en **verificacion-dia2.md**.
