# Seguridad básica para quienes programan

La seguridad no es un producto aparte: es un hábito. Empieza por no filtrar secretos y no confiar en lo que llega del cliente.

## API keys

La clave del modelo (Anthropic/Claude u otro) vive en el servidor, en variables de entorno. Nunca la pongas en el código del navegador ni la subas a Git. Si se filtra, revócala y crea otra.

## Ataques frecuentes (versión simple)

- XSS: inyectar script en una página. No pintes HTML crudo de usuarios.
- Inyección SQL: el atacante altera una consulta. Usa consultas parametrizadas.
- CSRF y sesiones: no asumas que un request “bonito” es de un usuario de confianza.

## Prompts e IA

Un usuario puede intentar que el bot ignore sus reglas. El system prompt ayuda, pero no es un muro perfecto: limita herramientas y no le des al modelo poder de borrar datos ni de ejecutar comandos del sistema.

## Ejercicios según tiempo

- 5 min: busca si tu `.gitignore` cubre `.env`.
- 15 min: mueve una clave del frontend al backend.
- 30 min: lista tres datos que tu app nunca debería loguear (contraseñas, tokens, tarjetas).
