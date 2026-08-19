# Git y GitHub

Git guarda instantáneas de tu código. GitHub (u otro remoto) las comparte con el equipo y sirve como entrega de un curso.

## Flujo mínimo

```
git status
git add .
git commit -m "Mensaje claro en presente"
git push
```

`status` te dice qué cambió. Un commit debe contar el *por qué* cuando no sea obvio.

## Ramas

Trabaja en una rama (`git switch -c feature/chat`) y ábrela contra `main` con un pull request. No subas archivos `.env` con secretos.

## .gitignore

Ignora `node_modules`, `.next` y `.env`. Sí versiona `.env.example` sin claves reales.

## Ejercicios según tiempo

- 5 min: `git status` y `git log -3` en un repo.
- 15 min: un commit con un mensaje útil.
- 30 min: publica el repo y pega la URL como entregable.
