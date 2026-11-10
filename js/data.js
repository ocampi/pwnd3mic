// Contenido del sitio. Edita este archivo para actualizar la página,
// no hace falta tocar el HTML. Lo que no tiene datos no se muestra:
// enlaces sin url, columnas vacías de la tabla y la sección de writeups
// mientras la lista esté vacía.

window.PWND3MIC = {
  equipo: {
    nombre: "pwnd3mic",
    lema: "No mercy.",
    descripcion:
      "Los mejores hackers de Chile. Somos un equipo de Hack The Box que resuelve máquinas, juega CTFs y hace pentesting.",
    pais: "Chile",
    fundado: null, // año de fundación, o null para no mostrarlo
    enfoque: ["Hack The Box", "CTF", "pentesting"],
  },

  // Lo que escribe la terminal de la portada.
  terminal: [
    { cmd: "whoami", out: "pwnd3mic" },
    { cmd: "cat lema.txt", out: "No mercy." },
    { cmd: "cat about.txt", out: "Los mejores hackers de Chile." },
    { cmd: "./propagar.sh", out: "[+] buscando la próxima máquina..." },
  ],

  // Un enlace aparece en Contacto solo cuando tiene url (https://... o mailto:...).
  enlaces: [
    { nombre: "Hack The Box", url: "https://app.hackthebox.com/teams/9999", detalle: "Perfil del equipo" },
    { nombre: "CTFtime", url: "", detalle: "Ranking y competencias" },
    { nombre: "GitHub", url: "", detalle: "Writeups y herramientas" },
    { nombre: "Discord", url: "", detalle: "Hablemos" },
    { nombre: "Correo", url: "", detalle: "Contacto directo" },
  ],

  // Datos tomados de Hack The Box el 2026-11-09. "maquinas" son roots (system owns).
  // Opcionales por miembro: certs (lista de certificaciones) y los perfiles
  // url (Hack The Box), linkedin y github.
  miembros: [
    {
      alias: "Byokii",
      rol: "Capitán",
      rango: "Pro Hacker",
      maquinas: 202,
      bio: "Sr. AppSec Engineer. Nivel 107 en HTB, en la plataforma desde 2023.",
      certs: ["CWEE", "CAPE", "OSWE", "CPTS", "OSCP+", "eMAPT", "OSWP"],
      url: "https://app.hackthebox.com/users/1688521",
      linkedin: "https://www.linkedin.com/in/byoki/",
    },
    {
      alias: "Ch4mp1",
      rol: "Miembro",
      rango: "Hacker",
      maquinas: 33,
      bio: "Nivel 60 en HTB, en la plataforma desde 2022.",
      certs: ["CJCA"],
      url: "https://app.hackthebox.com/users/1083683",
      linkedin: "https://www.linkedin.com/in/ocampillay/",
    },
  ],

  // Competencias jugadas, la más reciente primero.
  // Solo nombre y puesto son obligatorios. El resto es opcional:
  // fecha ("2026" o "2026-10"), formato, equipos (total de participantes) y puntos.
  ctfs: [
    {
      nombre: "Ejercicio Nacional de Ciberseguridad (ANCI)",
      fecha: "2026-10", // 29 de octubre de 2026, 14 retos completados
      puesto: 34,
      puntos: 835,
    },
    {
      nombre: "TRAMA CTF 2026 «Vector Fantasma» (Nodo TRAMA)",
      fecha: "2026-10", // 23 al 25 de octubre de 2026
      formato: "Remoto",
      puesto: 6,
    },
  ],

  // La sección Writeups aparece sola al agregar el primero. Formato de cada entrada:
  //   {
  //     titulo: "Nombre del reto o máquina",
  //     ctf: "TRAMA CTF 2026",
  //     categoria: "web",        // web, pwn, crypto, forensics, reversing, osint, misc...
  //     dificultad: "media",     // fácil, media o difícil
  //     fecha: "2026-10-24",
  //     resumen: "Una línea: de qué fallo se partió y cómo se llegó a la flag.",
  //     url: "https://...",      // enlace al writeup, ver writeups/PLANTILLA.md
  //   },
  writeups: [],
};
