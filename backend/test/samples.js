module.exports = {
      clientes: { nombre: 'Ana', apellidos: 'Solano', correo: 'ana@example.com', telefono: '88887777', identificacion: '123', direccion: 'San José', fechaRegistro: '2026-11-04', estado: 'activo' },
      casilleros: { numero: 'A1', direccionMiami: 'Miami', fechaApertura: '2026-11-04', estado: 'activo', clienteId: 1 },
      envios: { codigo: 'E1', fechaSalida: '2026-11-04', fechaEstimadaEntrega: '2026-11-10', estado: 'pendiente', costoTotal: 35, clienteId: 1 },
      paquetes: { tracking: 'T1', tiendaOrigen: 'Amazon', descripcion: 'Audífonos', pesoKg: 1, valorDeclaradoUsd: 50, fechaRecepcion: '2026-11-04', estado: 'recibido', casilleroId: 1, envioId: 1 },
      facturas: { numero: 'F1', fecha: '2026-11-04', subtotal: 35, impuestos: 4.55, total: 39.55, metodoPago: 'tarjeta', estadoPago: 'pendiente', envioId: 1 }
    };
