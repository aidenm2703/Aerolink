# Fase 1 v2: directorio de sucursales

Estado: implementada; pendiente de validación del usuario antes de iniciar tracking.

## Adiciones

- Columna sucursales.horario VARCHAR(255) nullable, sin cambiar el modelo ni las validaciones v1.
- Tabla técnica _aerolink_migrations_v2 para registrar migraciones. No es una entidad empresarial ni se incorpora a los 16 modelos o al resumen anterior.
- Seed independiente con 10 oficinas demo: San José Centro, Escazú, Heredia, Alajuela, Cartago, Liberia, Puntarenas, Limón, Pérez Zeledón y Miami.
- Costa Rica y Estados Unidos se resuelven por código; no se asumen IDs fijos.
- Bodegas y ubicaciones básicas en las oficinas demo de Heredia, Alajuela y Miami.
- GET /api/v2/sucursales: consulta autenticada con q, pais (código CR/US), estado, page y limit.
- GET /api/v2/sucursales/:id: detalle con bodegas y ubicaciones.
- Página protegida /v2/sucursales y enlace Directorio de sucursales en el menú.

Son ubicaciones ilustrativas en localidades reales, no oficinas reales de Aerolink. Las direcciones son referencias generales y los teléfonos son ficticios. La oficina original SUC-SJO no se actualiza, renombra ni duplica: San José Centro demo tiene un código distinto. Los horarios nuevos muestran zona horaria; la sucursal original mantiene horario NULL y se presenta como Horario no registrado.

## Comandos desde la raíz

```powershell
npm run migrate:v2
npm run seed:sucursales:v2
npm run test:v2
npm test
npm run test:mysql
npm run test:frontend
npm run build:frontend
```

Primero preparar las tablas originales con los comandos existentes si la base es nueva. La migración v2 únicamente añade horario y su registro técnico: no ejecuta sync({alter:true}), DROP ni recreación de tablas. MySQL confirma DDL implícitamente; la migración comprueba si la columna existe para poder reanudarse. Ejecutar las migraciones de forma secuencial, con una sola instancia del comando.

El seed usa transacción y findOrCreate por códigos únicos; solo escribe horario al crear una oficina nueva. No sobrescribe registros existentes, incluso si alguien modificó una oficina demo después del primer seed. La segunda ejecución real creó cero oficinas.

No se requieren API keys ni variables de entorno adicionales en esta fase. Claude/Gemini/n8n, tracking y notificaciones todavía no se implementan.

## Pruebas automáticas

La prueba nueva comprueba: migración repetida, seed repetido sin duplicar oficinas/bodegas/ubicaciones, conservación exacta de la respuesta v1 de la sucursal original, horario original NULL, datos v2, Miami y sus ubicaciones, 401/400/404, rechazo 409 por dependencias y validación v1 que sigue rechazando el campo horario.

Las suites previas de backend, autenticación y 233 peticiones MySQL para los 16 CRUD vuelven a pasar. Las 21 pruebas React originales y el build también pasan. Se agregaron dos pruebas del directorio: horario/detalle/filtro y errores de API. No se realizó inspección visual en navegador.

## Checklist manual para validar esta fase

- [ ] Iniciar o reiniciar backend con npm run dev y frontend con npm run dev:frontend.
- [ ] Iniciar sesión y abrir Directorio de sucursales.
- [ ] Confirmar las 10 oficinas demo y la sucursal original.
- [ ] Buscar Heredia y filtrar Estados Unidos; comprobar horario de Miami.
- [ ] Abrir una oficina demo con bodega y ver pasillo A, estante 01.
- [ ] Confirmar que la sucursal original conserva nombre, dirección, teléfono, país y estado.
- [ ] Ejecutar seed:sucursales:v2 dos veces y comprobar cero nuevas en la segunda.
- [ ] Abrir cada uno de los 15 módulos operativos y Usuario; crear, consultar, editar y borrar un registro temporal sin dependencias.
- [ ] Intentar borrar una sucursal con bodega y comprobar 409; conservar los registros de prueba necesarios para confirmar dependencias.
- [ ] Confirmar que login, logout y redirección por sesión vencida siguen funcionando.
- [ ] Consultar /api/v2/sucursales sin token y comprobar 401.
- [ ] Validar esta fase antes de iniciar la fase 2.
