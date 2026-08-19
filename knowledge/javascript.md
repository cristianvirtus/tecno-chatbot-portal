# JavaScript en el navegador

JavaScript hace interactiva una página: reacciona a clics, pide datos a un servidor y actualiza el DOM.

## Datos y funciones

Usa `const` por defecto y `let` si la variable cambia. Arrays y objetos son la base. Una función puede ser `function nombre()` o flecha `const nombre = () => {}`.

## Asincronía

`fetch` devuelve una Promise. Con `async/await` se lee más claro:

```
const respuesta = await fetch("/api/datos");
const datos = await respuesta.json();
```

Si la red falla, envuelve en `try/catch`.

## Eventos

`button.addEventListener("click", handler)` conecta la UI con la lógica. No bloquees el hilo principal con bucles enormes.

## Ejercicios según tiempo

- 5 min: un botón que cambia el texto de un párrafo.
- 15 min: llama a una API JSON y pinta un dato en pantalla.
- 30 min: un formulario que valida un correo y muestra un error si falta el `@`.
