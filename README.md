# pwnd3mic

Sitio web del equipo pwnd3mic (Hack The Box, CTFs y pentesting). Es un sitio estático: HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Estructura de la página |
| `css/style.css` | Estilos |
| `js/data.js` | Todo el contenido: equipo, miembros, CTFs, writeups y enlaces |
| `js/main.js` | Lógica que pinta el contenido y las animaciones |
| `assets/logo.svg` | Logo e icono |
| `writeups/PLANTILLA.md` | Plantilla para escribir writeups |

## Actualizar el contenido

Todo se edita en `js/data.js`. Lo que no tiene datos no se muestra:

- **Miembros:** agrega o edita entradas en `miembros`. El contador de roots de la portada es la suma de `maquinas`.
- **CTFs:** agrega la competencia al inicio de `ctfs`. Solo `nombre` y `puesto` son obligatorios. Con `equipos` el puesto se muestra como "#6 / 120".
- **Writeups:** copia `writeups/PLANTILLA.md`, escribe el writeup y agrega una entrada en `writeups` con su enlace. La sección aparece sola al agregar el primero.
- **Contacto:** rellena la `url` de cada enlace en `enlaces`. Los que quedan vacíos no aparecen.

## Verlo en local

```bash
npx serve .
```

También funciona abriendo `index.html` directamente en el navegador.

## Publicar

Al ser estático se puede servir desde GitHub Pages, Netlify o Cloudflare Pages apuntando a la raíz del repositorio, sin configuración de build.
