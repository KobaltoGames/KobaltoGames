const traducciones = {
  es: {
    langSelector: { label: "ES ▼" },
    nav: { timeline: "Nuestro Recorrido", team: "Equipo", gallery: "Galería" },
    team: { slogan: "Videojuegos Wah!ntasticos", aboutUs: "Somos Kobalto Games, un pequeño estudio indie ubicado en España, formado por un grupo de amigos que crean mundos extraños píxel a píxel." },
    sections: { team: "Nuestro equipo", timeline: "Nuestro recorrido", gallery: "Galería de juegos", games: "Explora nuestros juegos" },
    gamesMeta: {
      supperS: { name: "Suppers & Daggers", tagline: "El caos organizado", desc: "Suppers & Daggers es un mundo donde las cartas y los daggers se enfrentan en batallas tácticas." },
      wahTopia: { name: "Wah!Topia", tagline: "Un mundo por descubrir", desc: "Wah!Topia es un reino en crisis." }
    },
    gamesInfo: { supperSDesc: "RPG táctico donde el caos se encuentra con la estrategia.", supperSWah: "RPG de aventura en un mundo pixelado lleno de misterios." },
    pause: "En pausa",
    active: "En desarrollo",
    rights: "2025 KobaltoGames. Todos los derechos reservados.",
    gameDetails: { yearStart: "Año de inicio", status: "Estado", developer: "Desarrollador", genre: "Género" },
    teamRoles: { programador_principal: "Programador Principal", programador: "Programador", disenadora: "Diseñadora", artista_conceptual: "Artista Conceptual" },
    carousel: { G1: "Wah!Topia gameplay visual 1" }
  },
  en: {
    langSelector: { label: "EN ▼" },
    nav: { timeline: "Our Journey", team: "Team", gallery: "Gallery" },
    team: { slogan: "Wah!ntastic Games", aboutUs: "We are Kobalto Games, a small indie studio located in Spain." },
    sections: { team: "Our Team", timeline: "Our Journey", gallery: "Game Gallery", games: "Explore Our Games" },
    gamesMeta: {
      supperS: { name: "Suppers & Daggers", tagline: "Organized chaos", desc: "A world where cards and daggers face off in tactical battles." },
      wahTopia: { name: "Wah!Topia", tagline: "A world to discover", desc: "A kingdom in crisis." }
    },
    gamesInfo: { supperSDesc: "A tactical RPG where chaos meets strategy.", supperSWah: "An adventure RPG in a pixelated world full of mysteries." },
    pause: "Paused",
    active: "In development",
    rights: "2025 KobaltoGames. All rights reserved.",
    gameDetails: { yearStart: "Year started", status: "Status", developer: "Developer", genre: "Genre" },
    teamRoles: { programador_principal: "Lead Programmer", programador: "Programmer", disenadora: "Designer", artista_conceptual: "Concept Artist" },
    carousel: { G1: "Wah!Topia gameplay sample 1" }
  }
}

let indice = 0
let imagenes = []
let autoplayTimer = null
const AUTOPLAY_DELAY = 4000

let idiomaActual = "es"
const langBtn = document.getElementById("lang-btn")
const langList = document.getElementById("lang-list")

const navbar = document.getElementById("navbar")
const scrollTopBtn = document.getElementById("scrollTopBtn")
const hamburger = document.getElementById("hamburger")
const navLinks = document.getElementById("navLinks")

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50)
  scrollTopBtn.classList.toggle("visible", window.scrollY > 400)
})

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
})

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active")
  navLinks.classList.toggle("open")
})

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active")
    navLinks.classList.remove("open")
  })
})

const sections = document.querySelectorAll("section[id]")

function highlightNavLink() {
  const scrollY = window.scrollY + 100
  sections.forEach(section => {
    const h = section.offsetHeight
    const t = section.offsetTop
    const id = section.getAttribute("id")
    if (scrollY >= t && scrollY < t + h) {
      navLinks.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`)
      })
    }
  })
}

window.addEventListener("scroll", highlightNavLink)

function initAnimacionesScroll() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        obs.unobserve(entry.target)
      }
    })
  }, { rootMargin: "0px 0px -50px 0px", threshold: 0.1 })

  document.querySelectorAll(".fade-in, .slide-up, .scale-in").forEach(el => {
    obs.observe(el)
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom >= 0) {
      el.classList.add("visible")
      obs.unobserve(el)
    }
  })
}

function crearParticulas() {
  const container = document.querySelector(".bg-particles")
  if (!container) return
  for (let i = 0; i < 20; i++) {
    const span = document.createElement("span")
    span.style.left = Math.random() * 100 + "%"
    span.style.animationDelay = Math.random() * 15 + "s"
    span.style.animationDuration = (10 + Math.random() * 10) + "s"
    span.style.width = (2 + Math.random() * 4) + "px"
    span.style.height = span.style.width
    container.appendChild(span)
  }
}

async function cargarCarrusel() {
  const carrusel = document.getElementById("carrusel")
  if (!carrusel) return
  try {
    const res = await fetch("assets/data/carousel.json")
    imagenes = await res.json()
    crearImgs()
    mostrarImagen(indice)
    iniciarAutoplay()
    removeSkeleton("carousel")
  } catch (e) {
    console.error("Error carrusel:", e)
    removeSkeleton("carousel")
  }
}

function crearImgs() {
  const carrusel = document.getElementById("carrusel")
  carrusel.innerHTML = ""
  imagenes.forEach((img, i) => {
    const el = document.createElement("img")
    el.src = img.src
    el.alt = img.caption || "Imagen del juego"
    el.dataset.index = i
    el.style.opacity = 0
    el.style.position = "absolute"
    el.style.transition = "none"
    el.setAttribute("role", "button")
    el.setAttribute("tabindex", "0")
    el.classList.add("scale-in")
    el.addEventListener("click", () => {
      if (i !== indice) { mostrarImagen(i); reiniciarAutoplay() }
    })
    carrusel.appendChild(el)
  })
}

function mostrarImagen(n) {
  const carrusel = document.getElementById("carrusel")
  const imgs = carrusel.querySelectorAll("img")
  if (!imgs.length) return
  if (n < 0) n = imagenes.length - 1
  if (n >= imagenes.length) n = 0
  const isMobile = window.innerWidth <= 768
  imgs.forEach(img => {
    img.className = ""
    img.style.transition = "opacity 0.5s ease, transform 0.5s ease"
    img.style.opacity = 0
    img.style.pointerEvents = "none"
    img.style.transform = "translateX(0) scale(0.8)"
    img.style.zIndex = "1"
  })
  const centro = imgs[n]
  centro.classList.add("center")
  centro.style.opacity = 1
  centro.style.pointerEvents = "auto"
  centro.style.transform = "translateX(0) scale(1)"
  centro.style.zIndex = "10"
  if (!isMobile) {
    const li = imgs[(n - 1 + imagenes.length) % imagenes.length]
    const ri = imgs[(n + 1) % imagenes.length]
    li.classList.add("left")
    li.style.opacity = 0.7
    li.style.transform = "translateX(-220px) scale(0.7)"
    li.style.zIndex = "5"
    ri.classList.add("right")
    ri.style.opacity = 0.7
    ri.style.transform = "translateX(220px) scale(0.7)"
    ri.style.zIndex = "5"
  }
  indice = n
  const cap = accederPorRuta(window.idiomaJson || {}, imagenes[n].caption) || imagenes[n].caption || ""
  document.getElementById("caption").textContent = cap
}

function mover(d) { mostrarImagen(indice + d); reiniciarAutoplay() }

function iniciarAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
  autoplayTimer = setInterval(() => mover(1), AUTOPLAY_DELAY)
}

function reiniciarAutoplay() { clearInterval(autoplayTimer); iniciarAutoplay() }

async function cargarEquipo() {
  const contenedor = document.getElementById("equipo-container")
  if (!contenedor) return
  try {
    const res = await fetch("assets/data/team.json")
    const equipo = await res.json()
    contenedor.innerHTML = ""
    equipo.forEach((m, i) => {
      const tarjeta = document.createElement("div")
      tarjeta.className = "tarjeta scale-in"
      tarjeta.style.animationDelay = (i * 0.1) + "s"
      setMaskImage(tarjeta, m.imagen)
      const rol = accederPorRuta(window.idiomaJson || {}, 'teamRoles.' + m.rol.toLowerCase().replace(/\s+/g, '_')) || m.rol
      tarjeta.innerHTML = `
        <div class="fondo actual" style="background-image: url('${m.imagen}')"></div>
        <div class="fondo nuevo" style="background-image: url('${m.imagenHover}')"></div>
        <div class="tarjeta-texto">
          <h3>${m.nombre}</h3>
          <p>${rol}</p>
        </div>`
      contenedor.appendChild(tarjeta)
    })
    removeSkeleton("team")
  } catch (e) {
    console.error("Error equipo:", e)
    removeSkeleton("team")
  }
}

function setMaskImage(el, url) { el.style.setProperty('--mask-url', `url('../../${url}')`) }

async function cargarJuegosYTimeline() {
  const contenedorTimeline = document.getElementById("timeline-container")
  if (!contenedorTimeline) return
  contenedorTimeline.innerHTML = ""
  try {
    const res = await fetch("assets/data/games.json")
    const juegos = await res.json()
    juegos.forEach((j, idx) => {
      const nombre = accederPorRuta(window.idiomaJson || {}, j.nameKey) || j.nameKey
      const statusText = j.status === 'active'
        ? (window.idiomaJson?.active || 'En desarrollo')
        : (window.idiomaJson?.pause || 'En pausa')
      const enlace = document.createElement(j.url ? "a" : "span")
      if (j.url) {
        enlace.href = j.url
      } else {
        enlace.classList.add("no-link")
      }
      enlace.className = "timeline-card fade-in"
      enlace.style.animationDelay = (idx * 0.15) + "s"
      enlace.setAttribute("aria-label", `Ver más sobre ${nombre}`)
      enlace.innerHTML = `
        <img class="gameIcon" src="${j.icon}" alt="${nombre}">
        <div class="years">${j.start} - ${j.end}</div>
        <h3 class="timeline-card-color">${nombre}</h3>
        <p class="timeline-card-color">${statusText}</p>`
      contenedorTimeline.appendChild(enlace)
    })
    removeSkeleton("timeline")
  } catch (e) {
    console.error("Error timeline:", e)
    removeSkeleton("timeline")
  }
}

function removeSkeleton(type) {
  const s = document.querySelectorAll(`[data-skeleton="${type}"]`)
  s.forEach(el => el.classList.add("loaded"))
  setTimeout(() => s.forEach(el => el.remove()), 500)
}

async function cargarIdiomaInicial() {
  const guardado = localStorage.getItem("idioma") || "es"
  await cargarIdioma(guardado)
}

async function cargarIdioma(idioma) {
  langBtn.disabled = true
  try {
    let data
    try {
      const res = await fetch(`assets/i18n/${idioma}.json`)
      data = await res.json()
    } catch {
      data = traducciones[idioma] || traducciones.es
    }
    window.idiomaJson = data
    idiomaActual = idioma
    aplicarTraducciones(data)
    localStorage.setItem("idioma", idioma)
    langBtn.textContent = idioma.toUpperCase() + " ▼"
    const isIndex = window.location.pathname.includes("index.html") || window.location.pathname === "/"
    if (isIndex) await renderizarContenido()
  } catch (e) {
    console.error("Error idioma:", e)
  } finally {
    langBtn.disabled = false
  }
}

function aplicarTraducciones(json) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n")
    const val = accederPorRuta(json, key)
    if (val) el.textContent = val
  })
}

function accederPorRuta(obj, ruta) {
  return ruta.split('.').reduce((acc, key) => acc?.[key], obj) ?? ruta
}

function inicializarEventos() {
  const prev = document.getElementById("btn-prev")
  const next = document.getElementById("btn-next")
  if (prev) prev.addEventListener("click", () => mover(-1))
  if (next) next.addEventListener("click", () => mover(1))

  langBtn.addEventListener("click", () => {
    const expanded = langBtn.getAttribute("aria-expanded") === "true"
    langList.hidden = expanded
    langBtn.setAttribute("aria-expanded", !expanded)
  })

  langList.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
      cargarIdioma(e.target.getAttribute("data-lang"))
      langBtn.textContent = e.target.getAttribute("data-lang").toUpperCase() + " ▼"
    }
  })

  document.addEventListener("click", e => {
    if (!langBtn.contains(e.target) && !langList.contains(e.target)) {
      langList.hidden = true
      langBtn.setAttribute("aria-expanded", "false")
    }
  })

  window.addEventListener("resize", () => { mostrarImagen(indice); highlightNavLink() })
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") mover(-1)
    if (e.key === "ArrowRight") mover(1)
  })
}

async function renderizarContenido() {
  await Promise.all([cargarEquipo(), cargarJuegosYTimeline(), cargarCarrusel()])
  setTimeout(initAnimacionesScroll, 300)
}

window.addEventListener("DOMContentLoaded", async () => {
  crearParticulas()
  await cargarIdiomaInicial()
  inicializarEventos()
  initAnimacionesScroll()
})
