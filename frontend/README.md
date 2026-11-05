# Frontend React de Aerolink

Login, registro, panel y 16 páginas CRUD autenticadas. Vite sirve http://localhost:5173 y redirige /api al backend local en el puerto 3000.

Desde frontend: npm install, npm run dev, npm test y npm run build. Desde la raíz están disponibles dev:frontend, test:frontend y build:frontend. Primero iniciar el backend.

El token vive solo en AuthContext; recargar vuelve al login. No se usan localStorage ni sessionStorage. Los formularios consultan las relaciones por API y la eliminación requiere confirmación. No hay roles.

VITE_API_URL permite configurar un backend diferente al compilar; no colocar secretos en variables VITE_. En producción se necesita HTTPS y un servidor con fallback de rutas SPA hacia index.html.

