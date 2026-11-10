---
titulo: Nombre del reto o máquina
ctf: Nombre del CTF o plataforma
categoria: web
dificultad: media
fecha: 2026-11-09
autor: alias
resumen: Una línea que explique de qué fallo se partió y cómo se llegó a la flag.
---

Copia este archivo a la carpeta `privado/` con otro nombre (por ejemplo `privado/trama-reto-web.md`), escribe el writeup y ejecuta `node tools/cifrar.mjs`.

La categoría puede ser web, pwn, crypto, forensics, reversing, osint o misc. La dificultad puede ser fácil, media o difícil.

## Resumen

Dos o tres líneas: qué era el reto, cuál era el fallo y cómo se llegó a la flag.

## Reconocimiento

Qué se enumeró y qué se encontró. Incluye los comandos y la salida relevante.

```bash
nmap -sCV -p- 10.10.10.10
```

Las capturas se guardan junto al archivo y se enlazan así. Quedan cifradas igual que el texto:

![Descripción de la captura](img/captura.png)

## Explotación

Paso a paso, con el razonamiento detrás de cada decisión y los intentos que no funcionaron.

## Lecciones

- Qué se aprendió.
- Qué se haría distinto la próxima vez.
