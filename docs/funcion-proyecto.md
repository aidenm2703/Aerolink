# Qué hace Aerolink y por qué resulta útil

Aerolink es un sistema interno de administración para una empresa de casillero virtual y envíos internacionales entre Miami y Costa Rica. Reúne en MySQL información de clientes, paquetes, almacenes, transporte y cobros para reducir registros dispersos y facilitar consultas.

## Confirmación sobre las 16 entidades

**Las 16 entidades tienen una función administrativa implementada.** Cada una tiene su tabla en la base de datos, cinco endpoints de CRUD protegidos y una página React para consultar, crear, editar y eliminar con confirmación. Los datos se guardan y pueden recuperarse; las entidades relacionadas usan claves foráneas verificadas por el backend.

Las 15 entidades operativas participan en las relaciones del negocio. Usuario cumple una función transversal: permite autenticar el acceso a todos esos datos. No necesita pertenecer a un cliente ni a una sucursal para cumplir el alcance actual, que no incluye roles ni permisos diferenciados.

Su utilidad actual consiste en administrar información y registrar operaciones. A continuación se explica exactamente qué hace cada entidad, sin atribuirle automatizaciones que aún no están implementadas.

## Función administrativa de cada entidad

| Entidad | Qué permite gestionar actualmente | Con qué se conecta | Ejemplo de utilidad |
|---|---|---|---|
| **1. Cliente** | Contactos, identificación, dirección de entrega y estado del servicio. | Es propietario de casilleros y envíos. | Consultar a quién pertenece un envío y mantener actualizados sus datos de contacto. |
| **2. Casillero** | Número único, dirección de recepción en Miami, apertura y estado. | Pertenece a un cliente y recibe sus paquetes. | Identificar qué compras deben asignarse a un cliente al llegar a Miami. |
| **3. Paquete** | Tracking, tienda, descripción, peso, valor declarado, recepción y estado. | Pertenece a un casillero; puede asignarse a un envío; tiene movimientos e incidencias. | Registrar una compra y consultar sus datos antes de consolidarla o despacharla. |
| **4. Envío** | Código, fechas de salida y entrega estimada, costo acordado y estado. | Pertenece a un cliente; agrupa paquetes; tiene factura e intentos de entrega. | Reunir varias compras de un cliente en un mismo traslado. |
| **5. Factura** | Número, fecha, subtotal, impuestos, total, método y estado de pago. | Corresponde a un envío, con una factura como máximo por envío. | Consultar el cobro registrado y actualizar si está pendiente, pagado o anulado. La API comprueba que total sea subtotal más impuestos. |
| **6. País** | Código, nombre y estado de los países de operación o destino. | Lo referencian sucursales, transportistas y tarifas. | Mantener Costa Rica como destino comercial y ubicar administrativamente sus sucursales. |
| **7. Sucursal** | Oficina, dirección, teléfono y estado. | Pertenece a un país; tiene bodegas y participa en entregas. | Identificar la oficina que coordina un intento de entrega y sus almacenes asociados. |
| **8. Bodega** | Código, nombre, dirección y estado de un almacén. | Pertenece a una sucursal y contiene ubicaciones. | Distinguir el almacén de distribución de otros almacenes de la empresa. |
| **9. Ubicación** | Código de posición, pasillo, estante y estado disponible/bloqueada. | Pertenece a una bodega y se referencia en movimientos de paquetes. | Registrar que un paquete se colocó en el pasillo A, estante 01 de una bodega concreta. |
| **10. Transportista** | Proveedor, contacto, correo y estado. | Pertenece a un país y se usa en tarifas e intentos de entrega. | Registrar qué proveedor fue asignado a una entrega y cómo contactarlo. |
| **11. Servicio** | Código, nombre, descripción y estado de una modalidad comercial. | Tiene tarifas asociadas. | Mantener la modalidad express y consultar los precios registrados para ella. |
| **12. Tarifa** | Cargo base, precio por kilogramo, inicio de vigencia y estado. | Relaciona un servicio, un país de destino y un transportista. | Conservar un precio de referencia que el personal puede consultar al acordar el costo de un envío. No se aplica automáticamente a un envío. |
| **13. Movimiento** | Fecha, tipo de entrada/traslado/salida, observaciones y estado registrado/anulado. | Vincula un paquete con una ubicación física. | Documentar dónde se registró la entrada de un paquete o un traslado dentro de la operación. |
| **14. Entrega** | Fecha programada, destinatario, dirección y resultado del intento. | Vincula un envío, una sucursal y un transportista. | Registrar un intento fallido y programar otro intento para el mismo envío. |
| **15. Incidencia** | Problema, fecha, prioridad y estado de atención. | Pertenece a un paquete. | Registrar un embalaje dañado y actualizar la incidencia cuando se revise o resuelva. |
| **16. Usuario** | Cuentas con nombre, correo único, contraseña protegida y fecha de creación. | Registro, login y perfil; JWT protege los CRUD de todas las entidades. | Permitir que una persona inicie sesión para trabajar en el sistema; al cambiar su contraseña se invalidan sus tokens anteriores. |

## Cómo trabajan juntas

### Recepción, almacenamiento y despacho

1. Se registra un **Cliente** y se abre su **Casillero**.
2. Se recibe un **Paquete** y se asigna al casillero correspondiente.
3. La estructura **País → Sucursal → Bodega → Ubicación** identifica un lugar físico de la empresa.
4. Un **Movimiento** documenta la entrada, traslado o salida del paquete respecto a una ubicación.
5. Si se detecta un problema, se registra una **Incidencia** vinculada al paquete y se mantiene su estado de atención.
6. Se crea un **Envío** del cliente y se le asignan los paquetes que se trasladarán. La API comprueba que el casillero y el envío pertenezcan al mismo cliente.

### Precios, cobro y entrega

7. **Servicio**, **País** y **Transportista** permiten identificar una **Tarifa** de referencia. El personal consulta ese precio y registra manualmente el costo acordado en el envío.
8. Se crea la **Factura** del envío y se mantiene su estado de pago.
9. Se registra una **Entrega**, indicando sucursal coordinadora, transportista, destinatario y fecha programada.
10. El personal actualiza el resultado del intento y, por separado, los estados del envío y sus paquetes.

Todo este trabajo requiere una cuenta **Usuario** autenticada. Usuario y Cliente son distintos: una cuenta accede al sistema; un cliente recibe el servicio de casillero y transporte. Actualmente todos los usuarios autenticados tienen el mismo acceso.

## A quién ayuda

| Área | Ayuda concreta |
|---|---|
| Bodega | Consultar paquetes, la estructura física de almacenamiento y los movimientos registrados. |
| Operaciones | Organizar consolidaciones, proveedores e intentos de entrega. |
| Servicio al cliente | Identificar al propietario del paquete y consultar estados e incidencias. |
| Finanzas | Consultar precios de referencia, mantener facturas y registrar el estado de los pagos. |
| Administración | Mantener sucursales, servicios, catálogos y cuentas; consultar conteos del panel. |

## Qué aporta el CRUD de cada entidad

**Crear** permite registrar información nueva; **leer** permite consultarla; **actualizar** permite corregir datos y mantener estados; **eliminar** permite quitar capturas equivocadas cuando no tienen dependencias. La eliminación no sustituye una política de conservación de documentos de una empresa real.

Las relaciones evitan registros que apuntan a padres inexistentes. Por ejemplo, no se puede crear una ubicación con una bodega inexistente ni una entrega con un transportista inexistente. Si se intenta borrar un padre que todavía tiene registros dependientes, la API responde 409. La unicidad evita repetir identificadores como tracking, correo o código de negocio.

React presenta formularios y tablas; Express valida y procesa las solicitudes; MySQL conserva la información. JWT protege el acceso y bcrypt almacena hashes de las contraseñas sin devolverlos en las respuestas.

## Evidencia de funcionamiento administrativo

La suite de integración de MySQL prueba las 16 entidades mediante peticiones HTTP reales: crea registros temporales, los lista, los consulta por ID, los actualiza y los elimina. También comprueba duplicados, obligatorios, filtros y protección de las relaciones. La suite ampliada realiza **233 peticiones** y elimina solo los registros que ella misma crea.

La revisión anterior también verificó 21 pruebas de componentes React, 168 solicitudes de la colección y la compilación del frontend. Las pruebas de componentes usan un DOM simulado; no equivalen a una inspección visual en un navegador completo. El detalle está en [verificacion-dia2.md](verificacion-dia2.md).

## Alcance real y límites

- La trazabilidad se basa en información ingresada por el personal; no existe conexión automática con tiendas, aduanas ni sistemas de transportistas.
- Los movimientos documentan eventos asociados a una ubicación. No calculan inventario, capacidad ni una ubicación actual única automáticamente; tampoco son un historial inmutable porque el alcance exige CRUD.
- Una ubicación bloqueada o un catálogo inactivo permite registrar su situación administrativa. Ese estado no impide automáticamente seleccionarlo en otra operación.
- Las tarifas se usan como catálogo consultable. No se vincula una tarifa aplicada al envío ni se calcula su costo automáticamente; tampoco se resuelven de forma automática vigencias superpuestas.
- Registrar una entrega como entregada no actualiza automáticamente el envío o sus paquetes. Los estados se mantienen explícitamente en cada registro.
- La factura es un registro administrativo; no emite comprobantes fiscales ni procesa cobros bancarios. Marcar un pago como pagado representa lo registrado por el personal.
- No hay roles, permisos diferenciados ni asignación de responsables de incidencias. La autenticación controla quién puede entrar, según el alcance de la práctica.

Por tanto, las 16 entidades tienen una utilidad administrativa concreta y persistencia funcional. Algunas administran catálogos que otras entidades usan; otras registran operaciones, cobros o acceso. Las automatizaciones mencionadas como pendientes requieren reglas adicionales y no forman parte del funcionamiento que se afirma aquí.

## Ampliación vigente: agente aplicado y 20 entidades de negocio

La explicación anterior describe los 16 CRUD iniciales. La ampliación v2 añade vínculo Usuario–Cliente, perfil de seguimiento, eventos detallados y Notificación: ahora hay 20 entidades de negocio sin cambiar los contratos anteriores.

El agente está aplicado en dos flujos reales: consulta datos autorizados mediante herramientas y redacta respuestas en el chat; además escucha cambios de movimientos, entregas e incidencias para generar notificaciones. El panel y las alertas programadas aportan resúmenes, avisos de retraso y retiro. El Centro del asistente incorpora ayuda, traducción, borradores de incidencias, explicación de cobros, clima, mapa, QR, CSV, PDF administrativo y calendario.

La IA redacta y explica; las consultas verifican el cliente en Express y los documentos se generan con código determinista. No emite facturación fiscal ni calcula impuestos aduaneros. Correo/WhatsApp no están enviados ni configurados: el webhook opcional requiere proveedor y destinos.

Ver [agente-integrado.md](v2/agente-integrado.md) para saber dónde aparece cada opción, sus límites y las pruebas realizadas.
