// Página de writeups privados.
// El contenido vive cifrado en writeups/boveda.json (AES-256-GCM, clave derivada
// de la contraseña con PBKDF2-SHA256). Aquí no hay ninguna contraseña ni hash:
// si la contraseña es incorrecta, el descifrado simplemente falla.
// La bóveda se genera con: node tools/cifrar.mjs
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var vistas = ["candado", "vacio", "lista", "lector"];
  var writeups = [];
  var filtro = "todas";
  var boveda = null;

  function ver(id) {
    vistas.forEach(function (v) { $(v).hidden = v !== id; });
    window.scrollTo(0, 0);
  }

  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { if (h) n.appendChild(h); });
    return n;
  }

  /* Cifrado */
  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function descifrar(clave) {
    var base = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(clave), "PBKDF2", false, ["deriveKey"]);
    var llave = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: b64(boveda.salt), iterations: boveda.iter, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    var claro = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64(boveda.iv) }, llave, b64(boveda.ct));
    return JSON.parse(new TextDecoder().decode(claro));
  }

  /* Markdown a DOM. Nunca se usa innerHTML: todo el texto entra como texto. */
  function urlSegura(u) { return /^(https?:\/\/|mailto:)/i.test(u) ? u : ""; }
  function imagenSegura(u) { return /^data:image\/(png|jpeg|gif|webp);base64,/i.test(u) ? u : ""; }

  function enLinea(padre, texto) {
    var re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(!?\[[^\]]*\]\([^)\s]+\))/g;
    var ultimo = 0, m;
    while ((m = re.exec(texto))) {
      if (m.index > ultimo) padre.appendChild(document.createTextNode(texto.slice(ultimo, m.index)));
      var t = m[0];
      if (m[1]) padre.appendChild(el("code", { text: t.slice(1, -1) }));
      else if (m[2]) padre.appendChild(el("strong", { text: t.slice(2, -2) }));
      else if (m[3]) padre.appendChild(el("em", { text: t.slice(1, -1) }));
      else {
        var p = /^(!?)\[([^\]]*)\]\(([^)\s]+)\)$/.exec(t);
        if (p[1]) {
          var src = imagenSegura(p[3]);
          padre.appendChild(src
            ? el("img", { src: src, alt: p[2], loading: "lazy" })
            : document.createTextNode("[imagen no incluida: " + p[2] + "]"));
        } else {
          var href = urlSegura(p[3]);
          padre.appendChild(href
            ? el("a", { href: href, text: p[2], target: "_blank", rel: "noopener noreferrer" })
            : document.createTextNode(p[2]));
        }
      }
      ultimo = re.lastIndex;
    }
    if (ultimo < texto.length) padre.appendChild(document.createTextNode(texto.slice(ultimo)));
    return padre;
  }

  function markdown(destino, md) {
    var lineas = md.replace(/\r\n?/g, "\n").split("\n");
    var i = 0;
    var esBloque = function (l) {
      return /^(#{1,4} |```|>|\s*[-*] |\s*\d+\. |---\s*$)/.test(l);
    };
    while (i < lineas.length) {
      var l = lineas[i];
      if (!l.trim()) { i++; continue; }

      if (/^```/.test(l)) {
        var lenguaje = l.slice(3).trim(), codigo = [];
        i++;
        while (i < lineas.length && !/^```/.test(lineas[i])) codigo.push(lineas[i++]);
        i++;
        var pre = el("pre", lenguaje ? { "data-lenguaje": lenguaje } : {}, [
          el("code", { text: codigo.join("\n") }),
        ]);
        destino.appendChild(pre);
        continue;
      }
      var h = /^(#{1,4}) (.*)$/.exec(l);
      if (h) {
        // El título del writeup ya es el h1 de la página, así que "#" baja a h2.
        enLinea(destino.appendChild(el("h" + Math.max(2, h[1].length))), h[2]);
        i++; continue;
      }
      if (/^---\s*$/.test(l)) { destino.appendChild(el("hr")); i++; continue; }
      if (/^>/.test(l)) {
        var cita = [];
        while (i < lineas.length && /^>/.test(lineas[i])) cita.push(lineas[i++].replace(/^>\s?/, ""));
        enLinea(destino.appendChild(el("blockquote")), cita.join(" "));
        continue;
      }
      var esLista = /^\s*([-*]|\d+\.) /;
      if (esLista.test(l)) {
        var lista = el(/^\s*\d+\./.test(l) ? "ol" : "ul");
        while (i < lineas.length && esLista.test(lineas[i])) {
          enLinea(lista.appendChild(el("li")), lineas[i++].replace(esLista, ""));
        }
        destino.appendChild(lista);
        continue;
      }
      var parrafo = [];
      while (i < lineas.length && lineas[i].trim() && !esBloque(lineas[i])) parrafo.push(lineas[i++]);
      enLinea(destino.appendChild(el("p")), parrafo.join(" "));
    }
  }

  /* Vistas */
  function chipsDe(w) {
    return el("div", { class: "chips" }, [
      w.categoria ? el("span", { class: "chip", text: w.categoria }) : null,
      w.dificultad ? el("span", { class: "chip dif-" + w.dificultad, text: w.dificultad }) : null,
    ]);
  }
  function metaDe(w) {
    return [w.ctf, w.fecha, w.autor].filter(Boolean).join(" · ");
  }

  function pintarLista() {
    var caja = $("tarjetas");
    caja.textContent = "";
    writeups
      .filter(function (w) { return filtro === "todas" || w.categoria === filtro; })
      .forEach(function (w) {
        caja.appendChild(el("a", { class: "tarjeta", href: "#" + w.slug }, [
          el("span", { class: "meta", text: metaDe(w) }),
          el("h3", { text: w.titulo }),
          w.resumen ? el("p", { text: w.resumen }) : null,
          chipsDe(w),
        ]));
      });
  }

  function pintarFiltros() {
    var caja = $("filtros");
    caja.textContent = "";
    var cats = ["todas"];
    writeups.forEach(function (w) {
      if (w.categoria && cats.indexOf(w.categoria) < 0) cats.push(w.categoria);
    });
    caja.hidden = cats.length < 3;
    cats.forEach(function (c) {
      var b = el("button", { type: "button", text: c, "aria-pressed": String(c === filtro) });
      b.addEventListener("click", function () {
        filtro = c;
        pintarFiltros();
        pintarLista();
      });
      caja.appendChild(b);
    });
  }

  function ruta() {
    if (!writeups.length) return;
    var slug = decodeURIComponent(location.hash.slice(1));
    var w = writeups.filter(function (x) { return x.slug === slug; })[0];
    if (!w) {
      document.title = "Writeups | pwnd3mic";
      pintarFiltros();
      pintarLista();
      ver("lista");
      return;
    }
    document.title = w.titulo + " | pwnd3mic";
    var cab = $("lector-cabecera");
    cab.textContent = "";
    cab.appendChild(el("span", { class: "meta", text: metaDe(w) }));
    cab.appendChild(el("h1", { text: w.titulo }));
    cab.appendChild(chipsDe(w));
    var cuerpo = $("lector-cuerpo");
    cuerpo.textContent = "";
    markdown(cuerpo, w.md);
    ver("lector");
  }

  /* Arranque */
  $("form-clave").addEventListener("submit", async function (e) {
    e.preventDefault();
    var campo = $("clave"), aviso = $("aviso"), boton = this.querySelector("button");
    aviso.textContent = "";
    boton.disabled = true;
    boton.textContent = "Abriendo...";
    try {
      var datos = await descifrar(campo.value);
      writeups = (datos.writeups || []).sort(function (a, b) {
        return String(b.fecha || "").localeCompare(String(a.fecha || ""));
      });
      campo.value = "";
      if (writeups.length) ruta(); else ver("vacio");
    } catch (err) {
      aviso.textContent = "Contraseña incorrecta.";
      campo.select();
    }
    boton.disabled = false;
    boton.textContent = "Abrir";
  });

  $("cerrar").addEventListener("click", function () {
    // El contenido descifrado solo existe en memoria: recargar lo borra.
    location.hash = "";
    location.reload();
  });

  window.addEventListener("hashchange", ruta);

  if (!window.crypto || !crypto.subtle) {
    $("vacio").querySelector("p").textContent =
      "Este navegador no permite descifrar el contenido. Abre el sitio por HTTPS con un navegador actualizado.";
    ver("vacio");
    return;
  }

  fetch("writeups/boveda.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("sin bóveda"); return r.json(); })
    .then(function (j) { boveda = j; ver("candado"); $("clave").focus(); })
    .catch(function () { ver("vacio"); });
})();
