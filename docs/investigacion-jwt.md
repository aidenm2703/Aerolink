# Investigación previa: aplicación del token en Aerolink

## JWT y verificación

Un JWT firmado representa afirmaciones en tres segmentos Base64URL: header (tipo y algoritmo), payload (claims) y firma. La firma permite detectar alteraciones; el payload no está cifrado y puede leerse. En Aerolink se usa HS256 con una clave aleatoria de al menos 32 bytes, guardada únicamente en backend/.env. Se verifica con una lista explícita de algoritmos, emisor, audiencia y expiración. Decodificar sin verificar no autentica una petición. [RFC 7519](https://www.rfc-editor.org/info/rfc7519/), [RFC 8725](https://www.rfc-editor.org/info/rfc8725/).

En Node/Express, jsonwebtoken.sign emite el token con subject = ID de usuario, issuer = aerolink, audience = aerolink-web, iat y exp. jwt.verify comprueba firma y claims; el middleware consulta además que el usuario todavía exista. Un contador interno de versión permite invalidar sesiones al cambiar contraseña o correo. No se incluyen contraseñas, hashes, datos financieros ni identificación personal en el payload. [Documentación jsonwebtoken](https://github.com/auth0/node-jsonwebtoken/blob/master/README.md).

## Caducidad y renovación

El access token dura una hora. Al vencer, la API responde 401; React borra la sesión y lleva al login. No se prolonga la expiración de tokens vencidos. Un refresh token podría permitir renovación sin contraseña, pero necesitaría almacenamiento seguro, rotación y detección de reutilización. Esta entrega no implementa renovación automática: exige iniciar sesión de nuevo. La investigación distingue ese diseño futuro del flujo que realmente se entrega. [RFC 9700, sección 4.14](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14).

## Almacenamiento en React

| Opción | Ventaja | Riesgo y decisión |
|---|---|---|
| localStorage | Persiste tras cerrar el navegador | Cualquier JavaScript del origen puede leerlo; un XSS puede robarlo. No se usa. |
| sessionStorage | Se elimina al cerrar la pestaña | Sigue expuesto a XSS. No se usa. |
| Contexto React en memoria | Sin persistencia en disco, fácil envío Bearer | Una recarga exige login; un XSS activo todavía puede actuar como el usuario. Elegido para esta entrega. |
| Cookie HttpOnly, Secure y SameSite | Impide lectura directa por JavaScript | Se envía automáticamente y necesita diseño contra CSRF; no satisface por sí sola el flujo Bearer de esta práctica. Alternativa futura con backend de sesión. |

La aplicación usa AuthContext, no guarda tokens en Web Storage y evita HTML sin sanitizar. No se afirma que memoria elimine el riesgo XSS. OWASP desaconseja almacenar identificadores de sesión en localStorage y explica los controles adicionales de cookies. [OWASP HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

## Aplicación al proyecto

1. Registro valida nombre, correo único y contraseña de al menos ocho caracteres y máximo 72 bytes UTF-8. bcryptjs aplica hash con salt y coste 12; bcrypt es hash de una vía, no cifrado reversible. El límite evita truncamiento silencioso. [bcrypt.js](https://github.com/dcodeIO/bcrypt.js).
2. Login compara el hash y responde con token y usuario público. Credenciales incorrectas reciben un mensaje uniforme.
3. services/api.js añade Authorization: Bearer al llamar las rutas protegidas. El token nunca se añade a la URL.
4. El middleware rechaza token faltante, malformado, expirado, de otro algoritmo o de un usuario eliminado/invalido con 401. Las rutas de datos, usuarios, resumen y perfil requieren autenticación.
5. React protege páginas, limpia sesión ante 401 y permite cerrar sesión. Sin lista de revocación, un token copiado antes del logout puede seguir válido hasta expirar; cambiar contraseña o eliminar usuario lo invalida por la verificación en BD.
6. Registro y login son públicos por requisito académico. Todos los usuarios autenticados comparten acceso a los CRUD, incluido Usuario; no hay roles ni permisos diferenciados. Ese acceso global debe revisarse antes de un despliegue real.
7. Solo HTTPS fuera de localhost; no registrar tokens ni secretos y no subir .env. CORS se limita al origen del frontend. La clave se genera aleatoriamente y cambiarla invalida las sesiones.

Investigación realizada antes de implementar la autenticación. Se mantiene el proyecto local en el repositorio existente; no se publica la base ni sus credenciales.
