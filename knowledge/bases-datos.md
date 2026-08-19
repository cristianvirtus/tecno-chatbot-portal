# Bases de datos (visión práctica)

Una base de datos guarda información de forma persistente. Las relacionales (PostgreSQL, MySQL) usan tablas y SQL. Las documentales (MongoDB) guardan documentos parecidos a JSON.

## Relacional

Una tabla tiene filas y columnas. Las claves primarias identifican filas; las foráneas relacionan tablas (usuario → pedidos). Normalizar reduce duplicados.

## Consultas

`SELECT` lee, `INSERT` crea, `UPDATE` cambia, `DELETE` borra. Filtra con `WHERE`. Nunca concatenes texto de usuario en SQL: usa parámetros para evitar inyección.

## Cuándo no hace falta una base

Un corpus pequeño de un curso puede vivir en archivos Markdown. Una base sirve cuando hay muchos usuarios, historial o datos que cambian todo el tiempo.

## Ejercicios según tiempo

- 5 min: dibuja dos tablas (curso y alumno) y cómo se relacionan.
- 15 min: escribe un SELECT imaginario que liste alumnos de un curso.
- 30 min: explica la diferencia entre guardar un chat en memoria y en una tabla.
