let indice = 0;
let imagenes = [];
let autoplayTimer = null;
const AUTOPLAY_DELAY = 4000;

let idiomaActual = "es";
const langBtn = document.getElementById("lang-btn");
const langList = document.getElementById("lang-list");

window.addEventListener("DOMContentLoaded", () => {
  cargarIdiomaInicial();
  inicializarEventos();
});

/* CARROUSEL */
async function cargarCarrusel() {
  try {
    const res = await fetch("assets/data/carousel.json");
    imagenes = await res.json();
    crearImgs();
    mostrarImagen(indice);
    iniciarAutoplay();
  } catch (error) {
    console.error("Error cargando carrusel:", error);
  }
}

function crearImgs() {
  const carrusel = document.getElementById("carrusel");
  carrusel.innerHTML = "";
  imagenes.forEach((img, i) => {
    const imageElem = document.createElement("img");
    imageElem.src = img.src;
    imageElem.alt = img.caption || "Imagen del juego";
    imageElem.dataset.index = i;
    imageElem.style.opacity = 0;
    imageElem.style.position = "absolute";
    imageElem.style.transition = "none"; // Evita parpadeo inicial
    imageElem.setAttribute("role", "button");
    imageElem.setAttribute("tabindex", "0");

    imageElem.addEventListener("click", () => {
      if (i !== indice) {
        mostrarImagen(i);
        reiniciarAutoplay();
      }
    });

    carrusel.appendChild(imageElem);
  });
}

function mostrarImagen(nuevoIndice) {
  const carrusel = document.getElementById("carrusel");
  const imgs = carrusel.querySelectorAll("img");
  if (imgs.length === 0) return;
  if (nuevoIndice < 0) nuevoIndice = imagenes.length - 1;
  if (nuevoIndice >= imagenes.length) nuevoIndice = 0;

  const isMobile = window.innerWidth <= 768;

  imgs.forEach((img, i) => {
    img.className = "";
    img.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    img.style.opacity = 0;
    img.style.pointerEvents = "none";
    img.style.transform = "translateX(0) scale(0.8)";
    img.style.zIndex = "1";
  });

  const imgCentro = imgs[nuevoIndice];
  imgCentro.classList.add("center");
  imgCentro.style.opacity = 1;
  imgCentro.style.pointerEvents = "auto";
  imgCentro.style.transform = "translateX(0) scale(1)";
  imgCentro.style.zIndex = "10";

  if (!isMobile) {
    const leftIdx = (nuevoIndice - 1 + imagenes.length) % imagenes.length;
    const rightIdx = (nuevoIndice + 1) % imagenes.length;

    const imgLeft = imgs[leftIdx];
    imgLeft.classList.add("left");
    imgLeft.style.opacity = 0.7;
    imgLeft.style.transform = "translateX(-220px) scale(0.7)";
    imgLeft.style.zIndex = "5";

    const imgRight = imgs[rightIdx];
    imgRight.classList.add("right");
    imgRight.style.opacity = 0.7;
    imgRight.style.transform = "translateX(220px) scale(0.7)";
    imgRight.style.zIndex = "5";
  }

  indice = nuevoIndice;

  const captionTraducido = accederPorRuta(window.idiomaJson || {}, imagenes[indice].caption) || imagenes[indice].caption || "";
  document.getElementById("caption").textContent = captionTraducido;
}

function mover(direccion) {
  mostrarImagen(indice + direccion);
  reiniciarAutoplay();
}

function iniciarAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => mover(1), AUTOPLAY_DELAY);
}

function reiniciarAutoplay() {
  clearInterval(autoplayTimer);
  iniciarAutoplay();
}

/* CARGAR EQUIPO */
async function cargarEquipo() {
  try {
    const res = await fetch("assets/data/team.json");
    const equipo = await res.json();
    const contenedor = document.getElementById("equipo-container");
    contenedor.innerHTML = "";

    let i = 1;
    equipo.forEach(miembro => {
      const tarjeta = document.createElement("div");
      tarjeta.id = "tarjeta"+i++;
      tarjeta.className = "tarjeta";
      // tarjeta.style.backgroundImage = `url('${miembro.imagen}')`;

      setMaskImage(tarjeta, miembro.imagen);
      const rolTraducido = accederPorRuta(window.idiomaJson || {}, 'teamRoles.' + miembro.rol.toLowerCase().replace(/\s+/g, '_')) || miembro.rol;

      
      tarjeta.innerHTML = `
        <div class="fondo actual" style="background-image: url('${miembro.imagen}')"></div>
        <div class="fondo nuevo" style="background-image: url('${miembro.imagenHover}')"></div>
        <div class="tarjeta-texto">
          <h3>${miembro.nombre}</h3>
          <p>${rolTraducido}</p>
        </div>
      `;

      contenedor.appendChild(tarjeta);
    });
  } catch (error) {
    console.error("Error cargando equipo:", error);
  }
}
function setMaskImage(tarjetaEl, miembroImagenUrl) {
  tarjetaEl.style.setProperty('--mask-url', `url('../../${miembroImagenUrl}')`);
}

/* TIMELINE */
async function cargarJuegosYTimeline() {
  try {
    const res = await fetch("assets/data/games.json");
    const juegos = await res.json();
    const contenedorTimeline = document.getElementById("timeline-container");
    contenedorTimeline.innerHTML = "";

    juegos.forEach(juego => {
      const nombre = accederPorRuta(window.idiomaJson || {}, juego.nameKey) || juego.nameKey;
      const descripcion = accederPorRuta(window.idiomaJson || {}, juego.descriptionKey) || juego.descriptionKey;

      const card = document.createElement("div");
      card.className = "timeline-card";

      // <div class="years">${juego.start} - ${juego.end}</div>
      // <p>${descripcion}</p>
      card.innerHTML = `
        <img class="gameIcon" src="${juego.icon}" alt="${nombre}">
        <h3>${nombre}</h3>
      `;

      contenedorTimeline.appendChild(card);
    });

  } catch (e) {
    console.error("Error cargando juegos y timeline", e);
  }
}

/* LOCALIZATION */
function cargarIdiomaInicial() {
  const idiomaGuardado = localStorage.getItem("idioma") || "es";
  cargarIdioma(idiomaGuardado);
}

async function cargarIdioma(idioma) {
  langBtn.disabled = true;
  try {
    const response = await fetch(`assets/i18n/${idioma}.json`);
    const data = await response.json();
    window.idiomaJson = data;
    idiomaActual = idioma;
    aplicarTraducciones(data);
    localStorage.setItem("idioma", idioma);
    await renderizarContenido();
  } catch (e) {
    console.error("Error cargando idioma", e);
  } finally {
    langBtn.disabled = false;
  }
}

function aplicarTraducciones(json) {
  const elementos = document.querySelectorAll("[data-i18n]");
  elementos.forEach(el => {
    const clave = el.getAttribute("data-i18n");
    const valor = accederPorRuta(json, clave);
    if (valor) el.textContent = valor;
  });
}

function accederPorRuta(obj, ruta) {
  return ruta.split('.').reduce((acc, key) => acc?.[key], obj) ?? ruta;
}

/* CAMBIO DE IDIOMA + EVENTOS */
function inicializarEventos() {
  document.getElementById("btn-prev").addEventListener("click", () => mover(-1));
  document.getElementById("btn-next").addEventListener("click", () => mover(1));

  langBtn.addEventListener("click", () => {
    const expanded = langBtn.getAttribute("aria-expanded") === "true";
    langList.hidden = expanded;
    langBtn.setAttribute("aria-expanded", !expanded);
  });

  langList.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
      const selectedLang = e.target.getAttribute("data-lang");
      cargarIdioma(selectedLang);
      // langBtn.textContent = selectedLang.toUpperCase() + " ▼";
      // localStorage.setItem("idioma", selectedLang);
    }
  });

  document.addEventListener("click", e => {
    if (!langBtn.contains(e.target) && !langList.contains(e.target)) {
      langList.hidden = true;
      langBtn.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("resize", () => mostrarImagen(indice));
}

/* RENDER GLOBAL */
async function renderizarContenido() {
  await Promise.all([
    cargarEquipo(),
    cargarJuegosYTimeline(),
    cargarCarrusel()
  ]);
}
