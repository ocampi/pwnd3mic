// Cifra los writeups de la carpeta privado/ y genera writeups/boveda.json,
// que es lo único que se sube al repositorio.
//
// Uso:   node tools/cifrar.mjs
//
// Pide la contraseña sin mostrarla. Para automatizar se puede pasar en la
// variable de entorno PWND3MIC_CLAVE. Sin dependencias: solo Node 18 o superior.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, extname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pbkdf2Sync, randomBytes, createCipheriv } from "node:crypto";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(raiz, "privado");
const destino = join(raiz, "writeups", "boveda.json");
const ITERACIONES = 600000;
const LARGO_MINIMO = 14;
const TIPOS = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp" };

function pedir(pregunta) {
  return new Promise((ok) => {
    const entrada = process.stdin;
    process.stdout.write(pregunta);
    entrada.setRawMode(true);
    entrada.resume();
    entrada.setEncoding("utf8");
    let texto = "";
    const leer = (trozo) => {
      for (const c of trozo) {
        if (c === "\r" || c === "\n") {
          entrada.setRawMode(false);
          entrada.pause();
          entrada.off("data", leer);
          process.stdout.write("\n");
          return ok(texto);
        }
        if (c === "\u0003") process.exit(1);
        if (c === "\u007f" || c === "\b") texto = texto.slice(0, -1);
        else texto += c;
      }
    };
    entrada.on("data", leer);
  });
}

// Separa la cabecera "clave: valor" (entre líneas ---) del cuerpo en Markdown.
function leerWriteup(ruta) {
  const crudo = readFileSync(ruta, "utf8").replace(/\r\n?/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(crudo);
  const datos = {};
  let md = crudo;
  if (m) {
    md = m[2];
    for (const linea of m[1].split("\n")) {
      const p = /^([a-záéíóúñ_]+)\s*:\s*(.*)$/i.exec(linea);
      if (p) datos[p[1].toLowerCase()] = p[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  // Las imágenes locales se incrustan para que también queden cifradas.
  md = md.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (todo, alt, src) => {
    if (/^(https?:|data:)/i.test(src)) return todo;
    const archivo = resolve(dirname(ruta), src);
    const tipo = TIPOS[extname(archivo).toLowerCase()];
    if (!tipo || !existsSync(archivo)) {
      console.warn(`  aviso: no se pudo incluir la imagen ${src} (${basename(ruta)})`);
      return todo;
    }
    return `![${alt}](data:${tipo};base64,${readFileSync(archivo).toString("base64")})`;
  });
  const slug = basename(ruta, ".md").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    slug,
    titulo: datos.titulo || basename(ruta, ".md"),
    ctf: datos.ctf || "",
    categoria: (datos.categoria || "").toLowerCase(),
    dificultad: (datos.dificultad || "").toLowerCase(),
    fecha: datos.fecha || "",
    autor: datos.autor || "",
    resumen: datos.resumen || "",
    md: md.trim(),
  };
}

if (!existsSync(origen)) {
  mkdirSync(origen, { recursive: true });
  console.log("Se creó la carpeta privado/. Copia ahí writeups/PLANTILLA.md, escribe tu writeup y vuelve a ejecutar.");
  process.exit(0);
}

const archivos = readdirSync(origen).filter((f) => f.toLowerCase().endsWith(".md")).sort();
if (!archivos.length) {
  console.log("No hay archivos .md en privado/. Copia ahí writeups/PLANTILLA.md para empezar.");
  process.exit(0);
}

console.log(`Writeups encontrados: ${archivos.length}`);
const writeups = archivos.map((f) => {
  const w = leerWriteup(join(origen, f));
  console.log(`  ${w.slug}  (${w.titulo})`);
  return w;
});

let clave = process.env.PWND3MIC_CLAVE;
if (!clave) {
  if (!process.stdin.isTTY) {
    console.error("No hay terminal interactiva. Define PWND3MIC_CLAVE o ejecuta el comando en una terminal.");
    process.exit(1);
  }
  clave = await pedir("Contraseña del equipo: ");
  const otra = await pedir("Repite la contraseña: ");
  if (clave !== otra) {
    console.error("Las contraseñas no coinciden.");
    process.exit(1);
  }
}
if (clave.length < LARGO_MINIMO) {
  console.error(`La contraseña debe tener al menos ${LARGO_MINIMO} caracteres. Como el archivo cifrado es público, una clave corta se puede romper por fuerza bruta.`);
  process.exit(1);
}

const salt = randomBytes(16);
const iv = randomBytes(12);
const llave = pbkdf2Sync(clave, salt, ITERACIONES, 32, "sha256");
const cifrador = createCipheriv("aes-256-gcm", llave, iv);
const claro = Buffer.from(JSON.stringify({ writeups }), "utf8");
const ct = Buffer.concat([cifrador.update(claro), cifrador.final(), cifrador.getAuthTag()]);

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, JSON.stringify({
  v: 1,
  kdf: "PBKDF2-SHA256",
  iter: ITERACIONES,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  ct: ct.toString("base64"),
}) + "\n");

console.log(`Listo: writeups/boveda.json (${(ct.length / 1024).toFixed(1)} KB cifrados).`);
console.log("Ahora haz commit y push de ese archivo. La carpeta privado/ no se sube.");
