(function () {
  "use strict";

  var D = window.PWND3MIC;
  var nav = document.getElementById("nav");
  var $ = function (id) { return document.getElementById(id); };
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Crea un elemento. El texto siempre entra como textContent, nunca como HTML.
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

  // Solo se aceptan enlaces http(s) y mailto, para que data.js no pueda colar otra cosa.
  function urlSegura(u) {
    return typeof u === "string" && /^(https?:\/\/|mailto:)/i.test(u) ? u : "";
  }

  function enlaceExterno(n, url) {
    n.setAttribute("href", url);
    if (/^https?:/i.test(url)) {
      n.setAttribute("target", "_blank");
      n.setAttribute("rel", "noopener noreferrer");
    }
    return n;
  }

  function etiquetaEjemplo(item) {
    return item.ejemplo ? el("span", { class: "ejemplo", text: "ejemplo" }) : null;
  }

  function chips(lista) {
    return el("div", { class: "chips" }, lista.map(function (c) {
      return el("span", { class: "chip", text: c });
    }));
  }

  /* Portada y textos */
  $("lema").textContent = D.equipo.lema;
  $("descripcion").textContent = D.equipo.descripcion;
  $("origen").textContent = "Equipo de CTF · " + D.equipo.pais;
  $("pie-info").textContent = D.equipo.pais + (D.equipo.fundado ? " · desde " + D.equipo.fundado : "");

  var reales = function (l) { return l.filter(function (x) { return !x.ejemplo; }); };
  var cifras = [
    ["miembros", reales(D.miembros).length],
    ["roots en HTB", D.miembros.reduce(function (s, m) { return s + (m.maquinas || 0); }, 0)],
    ["CTFs jugados", reales(D.ctfs).length],
  ];
  cifras.forEach(function (c) {
    $("cifras").appendChild(el("div", {}, [
      el("dd", { text: String(c[1]) }),
      el("dt", { text: c[0] }),
    ]));
  });

  (D.equipo.enfoque || []).forEach(function (c) {
    $("categorias").appendChild(el("li", { class: "chip", text: c }));
  });

  /* Equipo */
  D.miembros.forEach(function (m) {
    // Cada perfil con url se muestra como un enlace al pie de la tarjeta.
    var perfiles = [["Hack The Box", m.url], ["LinkedIn", m.linkedin], ["GitHub", m.github]]
      .filter(function (p) { return urlSegura(p[1]); })
      .map(function (p) {
        return enlaceExterno(el("a", { text: p[0], "aria-label": p[0] + " de " + m.alias }), p[1]);
      });
    $("miembros").appendChild(el("article", { class: "tarjeta viva aparece" }, [
      etiquetaEjemplo(m),
      el("div", { class: "avatar", text: m.alias.charAt(0).toUpperCase(), "aria-hidden": "true" }),
      el("h3", { text: m.alias }),
      el("span", { class: "rol", text: m.rol }),
      m.bio ? el("p", { text: m.bio }) : null,
      (m.certs || []).length ? el("div", { class: "certs" }, m.certs.map(function (c) {
        return el("span", { class: "chip cert", text: c });
      })) : null,
      chips([m.rango, m.maquinas + " roots"]),
      perfiles.length ? el("div", { class: "perfiles" }, perfiles) : null,
    ]));
  });

  /* CTFs */
  function fechaCorta(f) {
    if (!f) return "";
    var p = String(f).split("-");
    if (p.length < 2) return p[0];
    var meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return (meses[parseInt(p[1], 10) - 1] || "") + " " + p[0];
  }
  D.ctfs.forEach(function (c) {
    var puesto = el("td", { class: "der puesto" }, [
      el("b", { text: "#" + c.puesto }),
      c.equipos ? el("small", { text: " / " + c.equipos }) : null,
    ]);
    $("tabla-ctfs").appendChild(el("tr", {}, [
      el("td", { class: "mono", text: fechaCorta(c.fecha) }),
      el("td", {}, [el("span", { text: c.nombre }), etiquetaEjemplo(c)]),
      el("td", { text: c.formato || "" }),
      puesto,
      el("td", { class: "der", text: c.puntos != null ? c.puntos.toLocaleString("es-CL") : "" }),
    ]));
  });

  // Las columnas opcionales (fecha, formato, puntos) se ocultan si ningún CTF las trae.
  [0, 2, 4].forEach(function (i) {
    var celdas = Array.prototype.map.call($("tabla-ctfs").rows, function (r) { return r.cells[i]; });
    if (celdas.some(function (c) { return c.textContent.trim(); })) return;
    celdas.forEach(function (c) { c.hidden = true; });
    document.querySelector("#ctfs thead tr").cells[i].hidden = true;
  });

  /* Contacto */
  D.enlaces.forEach(function (e) {
    var url = urlSegura(e.url);
    if (!url) return; // los enlaces sin url no se muestran
    var n = el(url ? "a" : "div", { class: "enlace" + (url ? "" : " pendiente") }, [
      el("strong", { text: e.nombre }),
      el("span", { text: url ? e.detalle : "Pendiente de configurar" }),
    ]);
    if (url) enlaceExterno(n, url);
    $("enlaces").appendChild(n);
  });

  // Numera solo las secciones visibles, para que no queden saltos.
  var n = 0;
  document.querySelectorAll("main .bloque").forEach(function (s) {
    if (s.hidden) return;
    n += 1;
    s.querySelector(".num").textContent = (n < 10 ? "0" : "") + n;
  });

  /* Menú móvil */
  var btn = document.querySelector(".menu-btn");
  btn.addEventListener("click", function () {
    var abierto = nav.classList.toggle("abierto");
    btn.setAttribute("aria-expanded", String(abierto));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("abierto");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  /* Aparición y sección activa */
  if ("IntersectionObserver" in window) {
    var ver = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visto"); ver.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".aparece").forEach(function (n) { ver.observe(n); });

    var activo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        nav.querySelectorAll("a").forEach(function (a) {
          a.classList.toggle("activo", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { activo.observe(s); });
  } else {
    document.querySelectorAll(".aparece").forEach(function (n) { n.classList.add("visto"); });
  }

  /* Terminal */
  (function () {
    var pre = $("terminal");
    var cursor = el("span", { class: "cursor" });

    function linea(prompt) {
      var l = el("div");
      if (prompt) l.appendChild(el("span", { class: "p", text: "$ " }));
      var t = el("span", prompt ? {} : { class: "o" });
      l.appendChild(t);
      pre.appendChild(l);
      return t;
    }

    if (quieto) {
      D.terminal.forEach(function (paso) {
        linea(true).textContent = paso.cmd;
        linea(false).textContent = paso.out;
      });
      return;
    }

    var i = 0;
    function siguiente() {
      if (i >= D.terminal.length) {
        var fin = linea(true);
        fin.parentNode.appendChild(cursor);
        return;
      }
      var paso = D.terminal[i++];
      var t = linea(true);
      t.parentNode.appendChild(cursor);
      var k = 0;
      (function teclear() {
        if (k < paso.cmd.length) {
          t.textContent += paso.cmd.charAt(k++);
          setTimeout(teclear, 45 + Math.random() * 55);
        } else {
          setTimeout(function () {
            linea(false).textContent = paso.out;
            setTimeout(siguiente, 520);
          }, 300);
        }
      })();
    }
    setTimeout(siguiente, 500);
  })();

  /* Fondo: red de nodos que se "contagian" por cercanía */
  (function () {
    var c = $("red");
    var ctx = c.getContext("2d");
    if (!ctx) return;
    var w, h, nodos = [], dpr = Math.min(window.devicePixelRatio || 1, 2);

    function medir() {
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(70, Math.round((w * h) / 26000));
      nodos = [];
      for (var i = 0; i < n; i++) {
        nodos.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          inf: i === 0 ? 1 : 0,
        });
      }
    }

    function cuadro() {
      ctx.clearRect(0, 0, w, h);
      var R = 130;
      for (var i = 0; i < nodos.length; i++) {
        var a = nodos[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        if (a.inf > 0) a.inf = Math.max(0, a.inf - 0.0015);
        for (var j = i + 1; j < nodos.length; j++) {
          var b = nodos[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > R) continue;
          var fuerza = 1 - d / R;
          var calor = Math.max(a.inf, b.inf);
          // El contagio pasa despacio entre vecinos conectados.
          if (a.inf > 0.5 && b.inf < 0.05 && Math.random() < 0.004) b.inf = 1;
          if (b.inf > 0.5 && a.inf < 0.05 && Math.random() < 0.004) a.inf = 1;
          ctx.strokeStyle = calor > 0.05
            ? "rgba(157,255,58," + (0.08 + 0.3 * calor) * fuerza + ")"
            : "rgba(140,160,148," + 0.1 * fuerza + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        ctx.fillStyle = a.inf > 0.05
          ? "rgba(157,255,58," + (0.35 + 0.6 * a.inf) + ")"
          : "rgba(140,160,148,0.35)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.inf > 0.05 ? 2.4 : 1.5, 0, 6.2832); ctx.fill();
      }
      // Si el brote se apaga, empieza otro.
      if (!nodos.some(function (n) { return n.inf > 0.5; }) && nodos.length) {
        nodos[Math.floor(Math.random() * nodos.length)].inf = 1;
      }
      if (!quieto) requestAnimationFrame(cuadro);
    }

    medir();
    cuadro();
    var espera;
    window.addEventListener("resize", function () {
      clearTimeout(espera);
      espera = setTimeout(function () { medir(); if (quieto) cuadro(); }, 150);
    });
  })();
})();
