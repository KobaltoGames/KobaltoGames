let indice = 0;
let imagenes = [];
let autoplayTimer = null;
const AUTOPLAY_DELAY = 4000;

let idiomaActual = "es";
const langBtn = document.getElementById("lang-btn");
const langList = document.getElementById("lang-list");

window.addEventListener("DOMContentLoaded", () => {
  cargarIdiomaInicial();
});

/* CARROUSEL */
document.getElementById("btn-prev").addEventListener("click", () => mover(-1));
document.getElementById("btn-next").addEventListener("click", () => mover(1));

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
    imageElem.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    imageElem.style.cursor = "pointer";

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
  if (nuevoIndice < 0) nuevoIndice = imagenes.length - 1;
  if (nuevoIndice >= imagenes.length) nuevoIndice = 0;

  imgs.forEach((img, i) => {
    img.style.opacity = 0;
    img.style.pointerEvents = "none";
    img.style.transform = "translateX(0) scale(0.8)";
    img.style.zIndex = "1";
  });

  imgs[nuevoIndice].style.opacity = 1;
  imgs[nuevoIndice].style.pointerEvents = "auto";
  imgs[nuevoIndice].style.transform = "translateX(0) scale(1)";
  imgs[nuevoIndice].style.zIndex = "10";

  let leftIdx = (nuevoIndice - 1 + imagenes.length) % imagenes.length;
  let rightIdx = (nuevoIndice + 1) % imagenes.length;

  imgs[leftIdx].style.opacity = 0.7;
  imgs[leftIdx].style.transform = "translateX(-220px) scale(0.7)";
  imgs[leftIdx].style.zIndex = "5";

  imgs[rightIdx].style.opacity = 0.7;
  imgs[rightIdx].style.transform = "translateX(220px) scale(0.7)";
  imgs[rightIdx].style.zIndex = "5";

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

    equipo.forEach(miembro => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta";

      const rolTraducido = accederPorRuta(window.idiomaJson || {}, 'teamRoles.' + miembro.rol.toLowerCase().replace(/\s+/g, '_')) || miembro.rol;

      tarjeta.innerHTML = `
        <div class="avatar" style="background-image: url('${miembro.imagen}'); background-size: cover; background-position: center;"></div>
        <h3>${miembro.nombre}</h3>
        <p>${rolTraducido}</p>
      `;

      contenedor.appendChild(tarjeta);
    });
  } catch (error) {
    console.error("Error cargando equipo:", error);
  }
}

/* TIMELINE */
async function cargarJuegosYTimeline() {
  try {
    const res = await fetch("assets/data/games.json");
    const juegos = await res.json();
    const anioMin = Math.min(...juegos.map(j => j.start));
    const anioMax = Math.max(...juegos.map(j => j.end));
    const rango = anioMax - anioMin + 1;

    const contenedorTimeline = document.querySelector(".timeline-bar");
    contenedorTimeline.innerHTML = "";
    const anchoDisponible = contenedorTimeline.offsetWidth;
    let nivelesOcupados = [];

    juegos.forEach(juego => {
      const nombre = accederPorRuta(window.idiomaJson || {}, juego.nameKey) || juego.nameKey;
      const descripcion = accederPorRuta(window.idiomaJson || {}, juego.descriptionKey) || juego.descriptionKey;

      const startOffset = (juego.start - anioMin) / rango;
      const duration = (juego.end - juego.start + 1) / rango;

      const left = startOffset * anchoDisponible;
      const width = duration * anchoDisponible;

      let nivel = 0;
      while (nivelesOcupados.some(entry =>
        !(left + width < entry.left || left > entry.left + entry.width) && entry.nivel === nivel
      )) {
        nivel++;
      }
      nivelesOcupados.push({ left, width, nivel });

      const card = document.createElement("div");
      card.className = "timeline-card";
      card.style.left = `${left}px`;
      card.style.width = `${width}px`;
      card.style.top = `${nivel * 160}px`;

      // card.onclick = () => window.location.href = juego.url;

      card.innerHTML = `
        <div class="years">${juego.start} - ${juego.end}</div>
        <h3>${nombre}</h3>
        <p>${descripcion}</p>
      `;
      contenedorTimeline.appendChild(card);
    });

    document.querySelector(".timeline-bar").style.height =
      `${(Math.max(...nivelesOcupados.map(n => n.nivel)) + 1) * 160}px`;
  } catch (e) {
    console.error("Error cargando juegos y timeline", e);
  }
}

/* LOCALIZATION */
function cargarIdiomaInicial() {
  const idiomaGuardado = localStorage.getItem("idioma") || "es";
  cargarIdioma(idiomaGuardado);
  langBtn.textContent = idiomaGuardado.toUpperCase() + " ▼";
}

async function cargarIdioma(idioma) {
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
  return ruta.split('.').reduce((acc, key) => acc?.[key], obj);
}

/* CAMBIO DE IDIOMA */
langBtn.addEventListener("click", () => {
  const expanded = langBtn.getAttribute("aria-expanded") === "true";
  langList.hidden = expanded;
  langBtn.setAttribute("aria-expanded", !expanded);
});

langList.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    const selectedLang = e.target.getAttribute("data-lang");
    cargarIdioma(selectedLang);
    langBtn.textContent = selectedLang.toUpperCase() + " ▼";
    localStorage.setItem("idioma", selectedLang);
  }
});

document.addEventListener("click", e => {
  if (!langBtn.contains(e.target) && !langList.contains(e.target)) {
    langList.hidden = true;
    langBtn.setAttribute("aria-expanded", "false");
  }
});

/* RENDER GLOBAL */
async function renderizarContenido() {
  await Promise.all([
    cargarEquipo(),
    cargarJuegosYTimeline(),
    cargarCarrusel()
  ]);
}
