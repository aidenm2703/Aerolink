# Aerolink: logística internacional con 16 entidades

Aerolink centraliza las compras recibidas en Miami y su traslado a Costa Rica. Resuelve la dispersión de datos de clientes y paquetes, la falta de trazabilidad física y los errores de facturación. Registra pesos, valores, tarifas y costos acordados; no automatiza cálculos aduaneros ni emisión fiscal.

Operaciones coordina servicios, transportistas e intentos de entrega; bodega ubica paquetes y registra movimientos; servicio al cliente consulta entregas e incidencias; finanzas administra tarifas y facturas.

| Entidades | Utilidad de crear, consultar, editar y eliminar |
|---|---|
| Cliente y Casillero | Mantener contactos y asignaciones del servicio. |
| Paquete y Envío | Controlar compras recibidas, consolidaciones y estados. |
| Factura | Registrar cobros, corregir importes y actualizar pagos. |
| País y Sucursal | Organizar la cobertura geográfica y las oficinas. |
| Bodega y Ubicación | Mantener almacenes, pasillos y estantes disponibles. |
| Transportista y Servicio | Administrar proveedores y modalidades de distribución. |
| Tarifa | Mantener precios por servicio, país y transportista. |
| Movimiento | Registrar y corregir entradas, traslados y salidas. |
| Entrega | Programar y consultar intentos de entrega. |
| Incidencia | Registrar problemas, asignar prioridad y seguir su resolución. |

El borrado permite corregir errores de captura y se rechaza cuando existen dependencias. Antes de producción se necesitan políticas de auditoría, anulación y retención para facturas y movimientos. El día 2 incorpora Usuario y un frontend React autenticado para trabajar con los 15 CRUD operativos y el CRUD de cuentas. No se implementan roles.


