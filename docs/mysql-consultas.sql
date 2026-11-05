-- Consultas de lectura para MySQL Workbench
USE aerolink;
SHOW TABLES;
SELECT * FROM clientes;
SELECT * FROM casilleros;
SELECT * FROM envios;
SELECT * FROM paquetes;
SELECT * FROM facturas;
SELECT * FROM paises;
SELECT * FROM sucursales;
SELECT * FROM bodegas;
SELECT * FROM ubicaciones;
SELECT * FROM transportistas;
SELECT * FROM servicios;
SELECT * FROM tarifas;
SELECT * FROM movimientos;
SELECT * FROM entregas;
SELECT * FROM incidencias;

SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'aerolink' ORDER BY TABLE_NAME, CONSTRAINT_NAME;


-- Las consultas de cuentas excluyen hashes y datos internos.
SELECT id, nombre, correo, fechaCreacion FROM usuarios;

