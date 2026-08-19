# JSON y datos

JSON es un formato de texto para intercambiar datos: objetos `{}`, listas `[]`, textos, números, booleanos y `null`. No admite comentarios.

## Ejemplo

```
{
  "curso": "agentes",
  "temas": ["prompts", "tools", "RAG"],
  "activo": true
}
```

En JavaScript, `JSON.parse` convierte texto a objeto y `JSON.stringify` hace lo inverso.

## APIs

Casi todas las APIs web modernas responden JSON. Revisa `Content-Type: application/json`. Si el parseo falla, el cuerpo no era JSON válido.

## Ejercicios según tiempo

- 5 min: escribe a mano un JSON de un usuario (nombre, edad, skills).
- 15 min: parsea un JSON y lee una propiedad anidada.
- 30 min: valida que un campo exista antes de usarlo para no romper la UI.
