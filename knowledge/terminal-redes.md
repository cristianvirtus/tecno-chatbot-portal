# Terminal, redes y cómo “vive” una app web

La terminal es una forma de hablarle al sistema con texto: `ls`, `cd`, `npm install`, `git status`.

## Local vs internet

`localhost` es tu máquina. Un deploy (Vercel u otro) pone la app en un servidor con HTTPS. El navegador del usuario llama a tu `/api/...` por la red.

## DNS y HTTPS

El dominio se traduce a una IP. HTTPS cifra el tráfico. En desarrollo a veces usas HTTP local; en producción, HTTPS.

## Variables de entorno

`ANTHROPIC_API_KEY` no es parte del código: el hosting la inyecta. En local va en `.env.local`, que no se versiona.

## Ejercicios según tiempo

- 5 min: abre la terminal, entra a la carpeta del proyecto y corre `ls`.
- 15 min: arranca el servidor de desarrollo y abre la URL que imprime.
- 30 min: dibuja el flujo: navegador → API route → OpenAI → respuesta.
