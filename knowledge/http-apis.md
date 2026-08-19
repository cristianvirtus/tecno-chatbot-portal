# HTTP y APIs REST

HTTP es el protocolo con el que el navegador y los servidores se hablan. Una petición tiene método, URL, cabeceras y a veces un cuerpo.

## Métodos frecuentes

- GET: leer un recurso. No debería cambiar datos.
- POST: crear o disparar una acción.
- PUT o PATCH: actualizar.
- DELETE: borrar.

Una API REST suele exponer recursos con URLs claras, por ejemplo `/usuarios/42`, y responde JSON.

## Códigos de estado

- 2xx: salió bien (200 OK, 201 creado).
- 4xx: error del cliente (400 mal pedido, 401 sin autenticar, 404 no existe).
- 5xx: error del servidor.

## Consejos para aprender

Si tienes 5 minutos: escribe en papel un GET a `/cursos` y un POST a `/cursos` con un JSON de ejemplo.
Si tienes 15 minutos: usa el DevTools del navegador (pestaña Red) y observa una petición real.
Si tienes 30 minutos: llama una API pública (por ejemplo una de clima o GitHub) y muestra el JSON en consola.
