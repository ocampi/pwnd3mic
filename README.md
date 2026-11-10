# pwnd3mic

Sitio web del equipo pwnd3mic (Hack The Box, CTFs y pentesting). Es un sitio estático: HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Página principal |
| `writeups.html` | Writeups privados, protegidos con contraseña |
| `css/style.css` | Estilos |
| `js/data.js` | Contenido de la página principal: equipo, miembros, CTFs y enlaces |
| `js/main.js` | Lógica de la página principal |
| `js/writeups.js` | Descifrado y lector de writeups |
| `tools/cifrar.mjs` | Herramienta que cifra los writeups |
| `writeups/PLANTILLA.md` | Plantilla para escribir writeups |
| `writeups/boveda.json` | Writeups cifrados (se genera, no se edita a mano) |
| `privado/` | Writeups en texto plano. No se sube: está en `.gitignore` |
| `assets/logo.svg` | Logo e icono |

## Actualizar la página principal

Todo se edita en `js/data.js`. Lo que no tiene datos no se muestra.

- **Miembros:** agrega o edita entradas en `miembros`. El contador de roots de la portada es la suma de `maquinas`.
- **CTFs:** agrega la competencia al inicio de `ctfs`. Solo `nombre` y `puesto` son obligatorios. Con `equipos` el puesto se muestra como "#6 / 120".
- **Contacto:** rellena la `url` de cada enlace en `enlaces`. Los que quedan vacíos no aparecen.

## Writeups privados

El repositorio es público, así que los writeups no se suben en texto plano. Se escriben en la carpeta `privado/`, que git ignora, y lo único que se publica es `writeups/boveda.json`: un archivo cifrado con AES-256-GCM cuya clave se deriva de la contraseña del equipo (PBKDF2-SHA256, 600.000 iteraciones). El navegador lo descifra al escribir la contraseña en `writeups.html`. En el sitio no hay ninguna contraseña ni hash que comparar.

### Publicar un writeup

1. Copia `writeups/PLANTILLA.md` a `privado/` con otro nombre, por ejemplo `privado/trama-reto-web.md`.
2. Rellena la cabecera y escribe el writeup. Las capturas van junto al archivo, por ejemplo en `privado/img/`.
3. Cifra todo:

   ```bash
   node tools/cifrar.mjs
   ```

   Pide la contraseña dos veces sin mostrarla.
4. Sube solo la bóveda:

   ```bash
   git add writeups/boveda.json
   git commit -m "Actualiza writeups"
   git push
   ```

Cada vez que se ejecuta, la herramienta vuelve a cifrar todos los archivos de `privado/`. Si falta uno, deja de estar publicado.

### A tener en cuenta

- **Usen siempre la misma contraseña.** La bóveda completa se cifra con la que se escriba en ese momento.
- **La contraseña tiene que ser larga.** El archivo cifrado es público, así que cualquiera puede descargarlo e intentar adivinarla sin límite de intentos. Una frase de cuatro o cinco palabras al azar es mejor que una clave corta con símbolos. La herramienta exige 14 caracteres como mínimo.
- **Compartan la contraseña por un canal privado**, nunca en el repositorio.
- **`privado/` no tiene copia en GitHub.** Si se pierde esa carpeta, los writeups solo se recuperan descifrando la bóveda. Guarden un respaldo.
- **Cambiar la contraseña no protege lo ya publicado.** Las bóvedas anteriores siguen en el historial de git con la contraseña antigua.
- **Markdown soportado:** títulos, párrafos, listas, citas, bloques de código, código en línea, negrita, cursiva, enlaces e imágenes locales (png, jpg, gif, webp).

## Verlo en local

```bash
npx serve .
```

La página de writeups necesita HTTPS o `localhost` para poder descifrar; no funciona abriendo el archivo con doble clic.

## Publicar

El sitio se sirve con GitHub Pages desde la rama `main`. Cada push se publica solo en cerca de un minuto.
