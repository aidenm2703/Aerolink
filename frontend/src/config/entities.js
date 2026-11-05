export const entities = {
  "clientes": {
    "title": "Clientes",
    "fields": [
      {
        "key": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true
      },
      {
        "key": "apellidos",
        "label": "Apellidos",
        "type": "text",
        "required": true
      },
      {
        "key": "correo",
        "label": "Correo electrónico",
        "type": "email",
        "required": true
      },
      {
        "key": "telefono",
        "label": "Teléfono",
        "type": "text",
        "required": true
      },
      {
        "key": "identificacion",
        "label": "Cédula / identificación",
        "type": "text",
        "required": true
      },
      {
        "key": "direccion",
        "label": "Dirección",
        "type": "text",
        "required": true
      },
      {
        "key": "fechaRegistro",
        "label": "Fecha de registro",
        "type": "date",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "activo",
          "inactivo"
        ]
      }
    ]
  },
  "casilleros": {
    "title": "Casilleros",
    "fields": [
      {
        "key": "numero",
        "label": "Número",
        "type": "text",
        "required": true
      },
      {
        "key": "direccionMiami",
        "label": "Dirección en Miami",
        "type": "text",
        "required": true
      },
      {
        "key": "fechaApertura",
        "label": "Fecha de apertura",
        "type": "date",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "activo",
          "inactivo"
        ]
      },
      {
        "key": "clienteId",
        "label": "Cliente",
        "type": "relation",
        "required": true,
        "reference": "clientes"
      }
    ]
  },
  "envios": {
    "title": "Envíos",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "fechaSalida",
        "label": "Fecha de salida",
        "type": "date",
        "required": true
      },
      {
        "key": "fechaEstimadaEntrega",
        "label": "Entrega estimada",
        "type": "date",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "pendiente",
          "en_transito",
          "entregado"
        ]
      },
      {
        "key": "costoTotal",
        "label": "Costo total (USD)",
        "type": "number",
        "required": true,
        "step": "0.01",
        "min": 0
      },
      {
        "key": "clienteId",
        "label": "Cliente",
        "type": "relation",
        "required": true,
        "reference": "clientes"
      }
    ]
  },
  "paquetes": {
    "title": "Paquetes",
    "fields": [
      {
        "key": "tracking",
        "label": "Tracking de la tienda",
        "type": "text",
        "required": true
      },
      {
        "key": "tiendaOrigen",
        "label": "Tienda de origen",
        "type": "text",
        "required": true
      },
      {
        "key": "descripcion",
        "label": "Descripción",
        "type": "text",
        "required": true
      },
      {
        "key": "pesoKg",
        "label": "Peso (kg)",
        "type": "number",
        "required": true,
        "step": "0.001",
        "min": 0.001
      },
      {
        "key": "valorDeclaradoUsd",
        "label": "Valor declarado (USD)",
        "type": "number",
        "required": true,
        "step": "0.01",
        "min": 0
      },
      {
        "key": "fechaRecepcion",
        "label": "Fecha de recepción",
        "type": "date",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "recibido",
          "en_bodega",
          "en_transito",
          "entregado"
        ]
      },
      {
        "key": "casilleroId",
        "label": "Casillero",
        "type": "relation",
        "required": true,
        "reference": "casilleros"
      },
      {
        "key": "envioId",
        "label": "Envío",
        "type": "relation",
        "required": false,
        "reference": "envios"
      }
    ]
  },
  "facturas": {
    "title": "Facturas",
    "fields": [
      {
        "key": "numero",
        "label": "Número",
        "type": "text",
        "required": true
      },
      {
        "key": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true
      },
      {
        "key": "subtotal",
        "label": "Subtotal (USD)",
        "type": "number",
        "required": true,
        "step": "0.01",
        "min": 0
      },
      {
        "key": "impuestos",
        "label": "Impuestos (USD)",
        "type": "number",
        "required": true,
        "step": "0.01",
        "min": 0
      },
      {
        "key": "total",
        "label": "Total (USD)",
        "type": "number",
        "required": true,
        "step": "0.01",
        "min": 0
      },
      {
        "key": "metodoPago",
        "label": "Método de pago",
        "type": "select",
        "required": true,
        "options": [
          "tarjeta",
          "transferencia",
          "efectivo"
        ]
      },
      {
        "key": "estadoPago",
        "label": "Estado de pago",
        "type": "select",
        "required": true,
        "options": [
          "pendiente",
          "pagado",
          "anulado"
        ]
      },
      {
        "key": "envioId",
        "label": "Envío",
        "type": "relation",
        "required": true,
        "reference": "envios"
      }
    ]
  },
  "paises": {
    "title": "Países",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "activo",
          "inactivo"
        ]
      }
    ]
  },
  "sucursales": {
    "title": "Sucursales",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true
      },
      {
        "key": "direccion",
        "label": "Dirección",
        "type": "text",
        "required": true
      },
      {
        "key": "telefono",
        "label": "Teléfono",
        "type": "text",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "activo",
          "inactivo"
        ]
      },
      {
        "key": "paisId",
        "label": "País",
        "type": "relation",
        "required": true,
        "reference": "paises"
      }
    ]
  },
  "bodegas": {
    "title": "Bodegas",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true
      },
      {
        "key": "direccion",
        "label": "Dirección",
        "type": "text",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "activo",
          "inactivo"
        ]
      },
      {
        "key": "sucursalId",
        "label": "Sucursal",
        "type": "relation",
        "required": true,
        "reference": "sucursales"
      }
    ]
  },
  "ubicaciones": {
    "title": "Ubicaciones",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "pasillo",
        "label": "Pasillo",
        "type": "text",
        "required": true
      },
      {
        "key": "estante",
        "label": "Estante",
        "type": "text",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "disponible",
          "bloqueada"
        ]
      },
      {
        "key": "bodegaId",
        "label": "Bodega",
        "type": "relation",
        "required": true,
        "reference": "bodegas"
      }
    ]
  },
  "transportistas": {
    "title": "Transportistas",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true
      },
      {
        "key": "telefono",
        "label": "Teléfono",
        "type": "text",
        "required": true
      },
      {
        "key": "correo",
        "label": "Correo electrónico",
        "type": "email",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "activo",
          "inactivo"
        ]
      },
      {
        "key": "paisId",
        "label": "País",
        "type": "relation",
        "required": true,
        "reference": "paises"
      }
    ]
  },
  "servicios": {
    "title": "Servicios",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true
      },
      {
        "key": "descripcion",
        "label": "Descripción",
        "type": "text",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "activo",
          "inactivo"
        ]
      }
    ]
  },
  "tarifas": {
    "title": "Tarifas",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "precioPorKg",
        "label": "Precio por kg (USD)",
        "type": "number",
        "required": true,
        "step": "0.01",
        "min": 0
      },
      {
        "key": "cargoBase",
        "label": "Cargo base (USD)",
        "type": "number",
        "required": true,
        "step": "0.01",
        "min": 0
      },
      {
        "key": "fechaVigencia",
        "label": "Vigencia desde",
        "type": "date",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "activo",
          "inactivo"
        ]
      },
      {
        "key": "servicioId",
        "label": "Servicio",
        "type": "relation",
        "required": true,
        "reference": "servicios"
      },
      {
        "key": "paisId",
        "label": "País",
        "type": "relation",
        "required": true,
        "reference": "paises"
      },
      {
        "key": "transportistaId",
        "label": "Transportista",
        "type": "relation",
        "required": true,
        "reference": "transportistas"
      }
    ]
  },
  "movimientos": {
    "title": "Movimientos",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true
      },
      {
        "key": "tipo",
        "label": "Tipo",
        "type": "select",
        "required": true,
        "options": [
          "entrada",
          "traslado",
          "salida"
        ]
      },
      {
        "key": "observaciones",
        "label": "Observaciones",
        "type": "text",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "registrado",
          "anulado"
        ]
      },
      {
        "key": "paqueteId",
        "label": "Paquete",
        "type": "relation",
        "required": true,
        "reference": "paquetes"
      },
      {
        "key": "ubicacionId",
        "label": "Ubicación",
        "type": "relation",
        "required": true,
        "reference": "ubicaciones"
      }
    ]
  },
  "entregas": {
    "title": "Entregas",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "fechaProgramada",
        "label": "Fecha programada",
        "type": "date",
        "required": true
      },
      {
        "key": "destinatario",
        "label": "Destinatario",
        "type": "text",
        "required": true
      },
      {
        "key": "direccion",
        "label": "Dirección",
        "type": "text",
        "required": true
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "pendiente",
          "en_ruta",
          "entregado",
          "fallido"
        ]
      },
      {
        "key": "envioId",
        "label": "Envío",
        "type": "relation",
        "required": true,
        "reference": "envios"
      },
      {
        "key": "sucursalId",
        "label": "Sucursal",
        "type": "relation",
        "required": true,
        "reference": "sucursales"
      },
      {
        "key": "transportistaId",
        "label": "Transportista",
        "type": "relation",
        "required": true,
        "reference": "transportistas"
      }
    ]
  },
  "incidencias": {
    "title": "Incidencias",
    "fields": [
      {
        "key": "codigo",
        "label": "Código",
        "type": "text",
        "required": true
      },
      {
        "key": "fecha",
        "label": "Fecha",
        "type": "date",
        "required": true
      },
      {
        "key": "descripcion",
        "label": "Descripción",
        "type": "text",
        "required": true
      },
      {
        "key": "prioridad",
        "label": "Prioridad",
        "type": "select",
        "required": true,
        "options": [
          "baja",
          "media",
          "alta"
        ]
      },
      {
        "key": "estado",
        "label": "Estado",
        "type": "select",
        "required": true,
        "options": [
          "abierta",
          "en_revision",
          "resuelta"
        ]
      },
      {
        "key": "paqueteId",
        "label": "Paquete",
        "type": "relation",
        "required": true,
        "reference": "paquetes"
      }
    ]
  },
  "usuarios": {
    "title": "Usuarios",
    "fields": [
      {
        "key": "nombre",
        "label": "Nombre",
        "type": "text",
        "required": true
      },
      {
        "key": "correo",
        "label": "Correo electrónico",
        "type": "email",
        "required": true
      },
      {
        "key": "password",
        "label": "Contraseña",
        "type": "password",
        "required": true
      }
    ]
  }
};
