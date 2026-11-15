/* ==================================================================
   DATOS DE TU INVITACIÓN · MODIFICA SOLAMENTE ESTE BLOQUE
   Deja "" si el dato aún no está confirmado.
   Fecha y hora de inicio: AAAA-MM-DDTHH:MM:SS (Ecuador).
   WhatsApp Ecuador: "5939XXXXXXXX" (sin +, sin el 0 inicial).
================================================================== */
const CONFIG = {
  nombre: 'Daira Elizabeth Pin Molina',
  fecha: '2026-12-18T19:00:00-05:00', // Ceremonia: 19:00, hora de Ecuador
  horaTexto: 'Ceremonia 19:00 · Recepción 20:00',
  whatsapp: '593989328876',          // Ecuador: 0989328876
  padres: 'Karen Molina Mendoza\ny\nSócrates Pin Palma',
  padrinos: 'Dayana Palma Rivas\ny\nLeonardo Palma Palma',
  pases: 3,                          // Admisión predeterminada: 3 personas
  ceremonia: {
    lugar: 'Iglesia San José de Picoazá',
    hora: '19:00 (7:00 p. m.)',
    direccion: "https://www.google.com/maps/search/?api=1&query=Iglesia%20San%20Jos%C3%A9%20de%20Picoaz%C3%A1%2C%20Portoviejo%2C%20Ecuador"
  },
  recepcion: {
    lugar: 'Tamarindo Real',
    hora: '20:00 (8:00 p. m.)',
    direccion: "https://www.google.com/maps/place/Club+de+Clases+Y+Polic%C3%ADas+Tamarindo+Real/@-1.0261444,-80.4774094,17z/data=!4m6!3m5!1s0x902bed6abd16cd2d:0x6558e3b8899c7cca!8m2!3d-1.0261399!4d-80.4774093!16s%2Fg%2F11c5bqpwt8?hl=en&entry=ttu&g_ep=EgoyMDI2MTEwMS4wIKXMDSoASAFQAw%3D%3D"
  },
  vestimenta: 'Formal / Elegante',
  recuerdos: "✨ Un recuerdo de esta noche especial ✨\n\nEn nuestro cordel de invitados encontrarás sobres y una pluma para que puedas escribir tus datos y dejarnos un lindo recuerdo de tu visita.\n\nGracias por acompañarnos y ser parte de esta noche mágica e inolvidable.\n\nCon cariño, Daira. 👑💗",
  iniciarMusicaAlAbrir: true
};

'use strict';
const $ = id => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const effectsLight = reducedMotion || Boolean(navigator.connection?.saveData) ||
  (navigator.deviceMemory > 0 && navigator.deviceMemory <= 4) ||
  (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
  window.matchMedia('(pointer: coarse)').matches;
document.body.classList.toggle('effects-light', effectsLight);
const audio = $('bgMusic');
const musicToggle = $('musicToggle');
let countdownTimer = null;
let isOpened = false;
let particulasCreadas = false;

function establecerTexto(id, value) {
  if (typeof value === 'string' && value.trim()) $(id).textContent = value.trim();
}

function fechaEcuador(texto) {
  // Coloca el desplazamiento horario -05:00 para que la fecha sea la misma
  // en Ecuador incluso si la invitación se abre en otro país.
  if (!texto || typeof texto !== 'string') return null;
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/;
  const simple = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;
  const full = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/i;
  if (!soloFecha.test(texto) && !simple.test(texto) && !full.test(texto)) return null;
  const fecha = new Date(soloFecha.test(texto) ? `${texto}T00:00:00-05:00` : simple.test(texto) ? `${texto}-05:00` : texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatoFecha(fecha, opciones = {}) {
  return new Intl.DateTimeFormat('es-EC', {
    timeZone: 'America/Guayaquil', weekday: 'long', day: 'numeric',
    month: 'long', year: 'numeric', ...opciones
  }).format(fecha);
}

function configurarPagina() {
  establecerTexto('parentsNames', CONFIG.padres);
  establecerTexto('godparentsNames', CONFIG.padrinos);
  establecerTexto('ceremonyVenue', CONFIG.ceremonia.lugar);
  establecerTexto('ceremonyTime', CONFIG.ceremonia.hora);
  establecerTexto('partyVenue', CONFIG.recepcion.lugar);
  establecerTexto('partyTime', CONFIG.recepcion.hora);
  establecerTexto('dressCodeText', CONFIG.vestimenta);
  establecerTexto('guestbookText', CONFIG.recuerdos);

  configurarMapa('ceremonyMap', CONFIG.ceremonia.direccion);
  configurarMapa('partyMap', CONFIG.recepcion.direccion);

  const pases = Number.parseInt(CONFIG.pases, 10);
  if (Number.isInteger(pases) && pases > 0) {
    $('passesNumber').textContent = String(pases);
    $('passesUnit').textContent = pases === 1 ? 'persona' : 'personas';
    $('passes').hidden = false;
  }

  const fecha = fechaEcuador(CONFIG.fecha);
  if (fecha) {
    const bonita = formatoFecha(fecha);
    $('heroDate').textContent = bonita;
    $('eventDate').textContent = bonita;
    const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(CONFIG.fecha);
    $('eventTime').textContent = CONFIG.horaTexto || (soloFecha ? 'Horario por confirmar' : formatoFecha(fecha, { weekday: undefined, day: undefined, month: undefined, year: undefined, hour: 'numeric', minute: '2-digit', hour12: true }));
    iniciarCuentaRegresiva(fecha, soloFecha);
  } else {
    establecerTexto('eventTime', CONFIG.horaTexto);
  }
  personalizarInvitado();
}

function configurarMapa(id, direccion) {
  if (!direccion || !direccion.trim()) return;
  const enlace = $(id);
  const sitio = direccion.trim();
  if (/^https:\/\//i.test(sitio)) {
    enlace.href = sitio;
  } else {
    enlace.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(sitio);
  }
  enlace.hidden = false;
}

function iniciarCuentaRegresiva(fecha, soloFecha = false) {
  const destino = fecha.getTime();
  const contador = $('countdown');
  const mensaje = $('countdownMessage');
  contador.classList.toggle('date-only', soloFecha);
  contador.setAttribute('aria-label', soloFecha ? 'Días para los quince años' : 'Tiempo restante para los quince años');
  ['hours', 'minutes', 'seconds'].forEach(id => { $(id).parentElement.hidden = soloFecha; });
  function actualizar() {
    const restante = destino - Date.now();
    if (restante <= 0) {
      clearInterval(countdownTimer);
      contador.hidden = true;
      mensaje.hidden = false;
      const diasPasados = (Date.now() - destino) / 86400000;
      mensaje.textContent = diasPasados < 1 ? '¡Hoy es el gran día! ✨' : '¡Gracias por haber formado parte de este momento tan especial!';
      return;
    }
    mensaje.hidden = true;
    contador.hidden = false;
    const valores = {
      days: soloFecha ? Math.ceil(restante / 86400000) : Math.floor(restante / 86400000),
      hours: Math.floor((restante % 86400000) / 3600000),
      minutes: Math.floor((restante % 3600000) / 60000),
      seconds: Math.floor((restante % 60000) / 1000)
    };
    Object.entries(valores).forEach(([id, valor]) => { $(id).textContent = String(valor).padStart(2, '0'); });
  }
  actualizar();
  if (!contador.hidden) countdownTimer = setInterval(actualizar, soloFecha ? 60000 : 1000);
}

function personalizarInvitado() {
  const params = new URLSearchParams(location.search);
  const nombre = (params.get('para') || '').trim().slice(0, 100);
  const pasesUrl = Number.parseInt(params.get('pases'), 10);
  if (nombre) {
    $('personalGreeting').textContent = `Esta invitación es especialmente para ti, ${nombre}. ♡`;
    $('personalGreeting').hidden = false;
    $('guestName').value = nombre;
  }
  if (Number.isInteger(pasesUrl) && pasesUrl >= 1 && pasesUrl <= 5) {
    $('passesNumber').textContent = String(pasesUrl);
    $('passesUnit').textContent = pasesUrl === 1 ? 'persona' : 'personas';
    $('passes').hidden = false;
  }
}

// Pantalla completa: se solicita DIRECTAMENTE al tocar "Abrir".
// Los navegadores solo permiten activarla como resultado de un toque o clic;
// se solicita durante el mismo clic de apertura.

function estaEnPantallaCompleta() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function activarPantallaCompleta() {
  if (estaEnPantallaCompleta()) return;
  const pagina = document.documentElement;
  try {
    const solicitud = typeof pagina.requestFullscreen === 'function'
      ? pagina.requestFullscreen({ navigationUI: 'hide' })
      : typeof pagina.webkitRequestFullscreen === 'function'
        ? pagina.webkitRequestFullscreen()
        : null;
    // Las restricciones del navegador no impiden mostrar la invitación.
    if (solicitud && typeof solicitud.catch === 'function') solicitud.catch(() => {});
  } catch (error) {
    // El navegador no permite modo pantalla completa para esta página.
  }
}

// Las dos hojas del castillo se abren sobre el mismo fondo de la escena.
// La animación se inicia con el clic y no depende de la reproducción de vídeo.
const welcome = $('welcome');
const introContent = [$('topbar'), $('contenido'), document.querySelector('footer')].filter(Boolean);
let introFinished = false;
let introPhotoStarted = false;
let introFinishTimer = null;
let introPhotoFrame = 0;
let introResizeFrame = 0;
const introStageTimers = [];
let introStartedAt = 0;
let detenerMariposasNaturales = () => {};
let reanudarMariposasNaturales = () => {};
let ajustarVueloMariposas = () => {};
let observadorEscenaIntro = null;
const introDurationMs = 5200;
const introPhotoDurationMs = 2800;
const introPhotoEntranceMs = reducedMotion ? 180 : 500;
const introPhotoExitMs = reducedMotion ? 180 : 700;
introContent.forEach(element => { element.inert = true; });

function mostrarFotoIntro() {
  if (introFinished || introPhotoStarted) return;
  introPhotoStarted = true;
  clearTimeout(introFinishTimer);
  const foto = $('introPortraitImage');
  function presentarFoto() {
    if (introFinished) return;
    clearTimeout(introFinishTimer);
    detenerMariposasNaturales();
    observadorEscenaIntro?.disconnect();
    // La entrada continúa la luz de las puertas; la salida está incluida
    // en los 2,8 segundos de la foto y descubre directamente la invitación.
    const retrato = $('portraitReveal');
    retrato.style.opacity = '0';
    welcome.classList.add('is-portrait');
    welcome.dataset.stage = 'portrait';
    retrato.setAttribute('aria-hidden', 'false');
    $('introStatus').textContent = 'Daira Elizabeth te da la bienvenida a sus quince años.';
    // Un solo reloj coordina entrada, pausa y salida. No se oculta la foto
    // antes de que su opacidad llegue a cero, aunque CSS se pause o se retrase.
    const inicioFoto = performance.now();
    const inicioSalida = introPhotoDurationMs - introPhotoExitMs;
    const suavizar = valor => {
      const progreso = Math.max(0, Math.min(1, valor));
      return progreso * progreso * (3 - 2 * progreso);
    };
    function avanzarFoto() {
      if (introFinished) return;
      clearTimeout(introFinishTimer);
      cancelAnimationFrame(introPhotoFrame);
      introPhotoFrame = 0;
      const transcurrido = performance.now() - inicioFoto;
      let opacidad = suavizar(transcurrido / introPhotoEntranceMs);
      if (transcurrido >= inicioSalida) {
        cerrarFotoIntro();
        opacidad = 1 - suavizar((transcurrido - inicioSalida) / introPhotoExitMs);
      }
      retrato.style.opacity = opacidad.toFixed(4);
      if (transcurrido >= introPhotoEntranceMs) welcome.classList.add('is-portrait-covered');
      if (transcurrido >= introPhotoDurationMs) mostrarInvitacion();
      else if (transcurrido >= introPhotoEntranceMs && transcurrido < inicioSalida) {
        // Durante la pausa no se repinta ni se ejecuta un bucle de animación.
        introFinishTimer = setTimeout(avanzarFoto, inicioSalida - transcurrido);
      } else {
        introPhotoFrame = requestAnimationFrame(avanzarFoto);
        // Respaldo para pestañas sin fotogramas de renderizado disponibles.
        introFinishTimer = setTimeout(avanzarFoto, 80);
      }
    }
    avanzarFoto();
  }
  if (foto.complete) {
    if (foto.naturalWidth) presentarFoto();
    else mostrarInvitacion();
  } else {
    // La secuencia empieza cuando la foto está disponible.
    foto.addEventListener('load', presentarFoto, { once:true });
    foto.addEventListener('error', mostrarInvitacion, { once:true });
    introFinishTimer = setTimeout(mostrarInvitacion, 3000);
  }
}

function cerrarFotoIntro() {
  if (introFinished || welcome.classList.contains('is-portrait-exiting')) return;
  welcome.classList.add('is-portrait-exiting');
  welcome.dataset.stage = 'portrait-exit';
  // El contenido sigue bloqueado hasta que termina el fundido.
}

function mostrarInvitacion() {
  if (introFinished) return;
  introFinished = true;
  detenerMariposasNaturales();
  observadorEscenaIntro?.disconnect();
  clearTimeout(introFinishTimer);
  cancelAnimationFrame(introPhotoFrame);
  cancelAnimationFrame(introResizeFrame);
  introStageTimers.forEach(clearTimeout);
  introStageTimers.length = 0;
  welcome.dataset.stage = 'finished';
  welcome.classList.add('is-gone');
  welcome.setAttribute('aria-hidden', 'true');
  welcome.inert = true;
  document.body.classList.remove('intro-locked');
  crearParticulas();
  introContent.forEach(element => { element.inert = false; });
  const titulo = $('heroTitle');
  titulo.setAttribute('tabindex', '-1');
  titulo.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  try {
    const id = decodeURIComponent(location.hash.slice(1));
    const destino = id && document.getElementById(id);
    if (destino) destino.scrollIntoView({ behavior: 'auto' });
  } catch (error) { /* Un fragmento no válido no impide entrar. */ }
  if (introPhotoStarted) welcome.hidden = true;
  else setTimeout(() => { welcome.hidden = true; }, 850);
}

function ajustarEspacioBotonIntro() {
  if (introFinished || isOpened) return;
  const titulo = welcome.querySelector('.portal-title');
  const boton = $('openInvitationBtn');
  // Medir con las fuentes y la altura reales; conservar la posición original
  // cuando ya hay espacio, y dejar 28 px libres encima del botón.
  welcome.style.setProperty('--intro-title-offset', '0px');
  const limite = boton.getBoundingClientRect().top - 28;
  const desplazamiento = Math.max(0, titulo.getBoundingClientRect().bottom - limite);
  if (desplazamiento > 0) {
    welcome.style.setProperty('--intro-title-offset', `${desplazamiento.toFixed(2)}px`);
  }
}

function prepararRecorridoCastillo() {
  const escena = welcome.querySelector('.portal-media');
  const puerta = welcome.querySelector('.castle-portal');
  const lienzo = $('welcomeScene') || welcome;
  const ancho = lienzo.clientWidth;
  const alto = lienzo.clientHeight;
  welcome.style.setProperty('--intro-scene-height', `${alto}px`);
  // offsetWidth/Height no incluyen el zoom de la animación.
  const anchoPuerta = puerta.offsetWidth || escena.offsetWidth * .125;
  const altoPuerta = puerta.offsetHeight || escena.offsetHeight * .306640625;
  const cerca = Math.min(2.4, Math.max(1.65, alto * .72 / altoPuerta));
  // La luz ya cubre el final del recorrido: limitar el zoom evita una
  // textura del castillo de decenas de miles de píxeles en la GPU.
  const dentro = Math.min(effectsLight ? 3.2 : 4.2,
    Math.max(ancho / anchoPuerta, alto / altoPuerta) * 1.3);
  const moverX = escena.offsetWidth / 2 - (puerta.offsetLeft + anchoPuerta / 2);
  const moverY = escena.offsetHeight / 2 - (puerta.offsetTop + altoPuerta / 2);
  const datos = {
    '--camera-near': cerca.toFixed(3), '--camera-far': dentro.toFixed(3),
    '--camera-x': `${moverX.toFixed(2)}px`, '--camera-y': `${moverY.toFixed(2)}px`,
    '--camera-near-x': `${(moverX * .85).toFixed(2)}px`,
    '--camera-near-y': `${(moverY * .85).toFixed(2)}px`,
    '--camera-start-y': `${(moverY * .12).toFixed(2)}px`,
    '--camera-half-x': `${(moverX * .45).toFixed(2)}px`,
    '--camera-half-y': `${(moverY * .45).toFixed(2)}px`
  };
  Object.entries(datos).forEach(([nombre, valor]) => welcome.style.setProperty(nombre, valor));
  ajustarEspacioBotonIntro();
}
function ajustarEscenaIntro() {
  if (introFinished || introPhotoStarted) return;
  prepararRecorridoCastillo();
  ajustarVueloMariposas();
}
function solicitarAjusteIntro() {
  if (introFinished || introPhotoStarted || introResizeFrame) return;
  introResizeFrame = requestAnimationFrame(() => {
    introResizeFrame = 0;
    ajustarEscenaIntro();
  });
}
window.addEventListener('resize', solicitarAjusteIntro, { passive:true });

function abrirInvitacion() {
  if (isOpened) return;
  isOpened = true;
  welcome.dataset.animation = 'castle';
  introStartedAt = Date.now();
  prepararRecorridoCastillo();
  welcome.style.setProperty('--intro-duration', `${introDurationMs}ms`);
  welcome.style.setProperty('--door-delay', `${introDurationMs * .25}ms`);
  welcome.style.setProperty('--door-duration', `${introDurationMs * .40}ms`);
  welcome.classList.add('is-opening');
  welcome.dataset.stage = 'approach';
  [
    [.25, 'doors', 'Llegamos a las puertas del castillo.'],
    [.56, 'portal', 'Las puertas se abren y muestran el salón.'],
    [.72, 'entering', 'Entramos al castillo entre flores y destellos.'],
    [.90, 'inside', 'Bienvenido a una noche de cuento.']
  ].forEach(([momento, etapa, mensaje]) => {
    introStageTimers.push(setTimeout(() => {
      welcome.dataset.stage = etapa;
      $('introStatus').textContent = mensaje;
    }, introDurationMs * momento));
  });
  $('openInvitationBtn').disabled = true;
  $('introStatus').textContent = 'Nos acercamos a las puertas del castillo.';
  welcome.focus({ preventScroll: true });
  // Después de las puertas aparece el retrato y luego la invitación.
  introFinishTimer = setTimeout(mostrarFotoIntro, introDurationMs + 300);
  if (CONFIG.iniciarMusicaAlAbrir) reproducirMusica();
  activarPantallaCompleta();
}
welcome.querySelector('.castle-flash').addEventListener('animationend', event => {
  if (event.animationName === 'castle-arrival' && isOpened && Date.now() - introStartedAt >= introDurationMs - 100) mostrarFotoIntro();
});
$('openInvitationBtn').addEventListener('click', abrirInvitacion);

async function reproducirMusica() {
  try {
    audio.volume = 0.42;
    await audio.play();
    actualizarEstadoMusica(true);
  } catch (error) {
    actualizarEstadoMusica(false);
    // Si el navegador bloquea el sonido, la persona puede pulsar Música.
  }
}
function actualizarEstadoMusica(activa) {
  musicToggle.classList.toggle('is-playing', activa);
  musicToggle.setAttribute('aria-pressed', String(activa));
  musicToggle.setAttribute('aria-label', activa ? 'Pausar música' : 'Activar música');
  musicToggle.querySelector('.music-icon').textContent = activa ? '♫' : '♪';
}
musicToggle.addEventListener('click', () => {
  if (audio.paused) reproducirMusica();
  else { audio.pause(); actualizarEstadoMusica(false); }
});
audio.addEventListener('pause', () => actualizarEstadoMusica(false));
audio.addEventListener('play', () => actualizarEstadoMusica(true));

// Flores y brillos generados dinámicamente (menos en móviles).
function crearParticulas() {
  if (reducedMotion || particulasCreadas) return;
  particulasCreadas = true;
  const cantidad = effectsLight ? 6 : 12;
  const capa = $('petalsLayer');
  for (let i=0; i<cantidad; i++) {
    const petalo = document.createElement('i');
    petalo.className = i % 3 === 0 ? 'petal castle-bloom' : 'petal';
    petalo.style.setProperty('--left', `${Math.random()*100}%`);
    petalo.style.setProperty('--size', `${9+Math.random()*13}px`);
    petalo.style.setProperty('--duration', `${11+Math.random()*13}s`);
    petalo.style.setProperty('--delay', `${-Math.random()*20}s`);
    petalo.style.setProperty('--drift', `${-110+Math.random()*220}px`);
    capa.appendChild(petalo);
  }
  const brillos = $('sparklesLayer');
  for (let i=0; i<(effectsLight ? 4 : 7); i++) {
    const brillo = document.createElement('i');
    brillo.className = 'sparkle';
    brillo.textContent = i%2 ? '✦' : '✧';
    brillo.style.setProperty('--left', `${Math.random()*100}%`);
    brillo.style.setProperty('--top', `${Math.random()*100}%`);
    brillo.style.setProperty('--size', `${8+Math.random()*9}px`);
    brillo.style.setProperty('--duration', `${2+Math.random()*4}s`);
    brillo.style.setProperty('--delay', `${-Math.random()*5}s`);
    brillos.appendChild(brillo);
  }
}

// Efecto de aparición suave al desplazarse.
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .09, rootMargin: '0px 0px -25px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

// Ventanas informativas accesibles y cerrables con Escape.
document.querySelectorAll('[data-modal]').forEach(boton => {
  boton.addEventListener('click', () => $(boton.dataset.modal).showModal());
});
document.querySelectorAll('dialog').forEach(modal => {
  modal.querySelector('.dialog-close')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
});

function numeroWhatsApp() {
  const numero = String(CONFIG.whatsapp || '').replace(/\D/g,'');
  return /^\d{8,15}$/.test(numero) ? numero : null;
}
function enviarWhatsApp(mensaje, feedback) {
  const numero = numeroWhatsApp();
  if (!numero) {
    feedback.textContent = 'Falta configurar el número de WhatsApp en script.js (CONFIG.whatsapp).';
    return;
  }
  feedback.textContent = 'Se abrirá WhatsApp para que envíes el mensaje.';
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.target = '_blank';
  enlace.rel = 'noopener noreferrer';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
}

$('rsvpForm').addEventListener('submit', e => {
  e.preventDefault();
  const nombre = $('guestName').value.trim();
  if (!nombre) { $('guestName').focus(); return; }
  const asistencia = document.querySelector('input[name="asistencia"]:checked').value;
  const fecha = fechaEcuador(CONFIG.fecha);
  const mensaje = [
    '✨ *CONFIRMACIÓN · MIS XV AÑOS DE CUENTO* ✨',
    `Hola, soy *${nombre}*.`,
    `Te escribo por los XV años de *${CONFIG.nombre}*.`,
    `Asistencia: *${asistencia}*.`,
    `Fecha: ${fecha ? formatoFecha(fecha) : 'por confirmar'}.`,
    `Lugar: ${CONFIG.recepcion.lugar || 'por confirmar'}.`,
    '¡Gracias por la invitación! 💙'
  ].join('\n');
  enviarWhatsApp(mensaje, $('rsvpFeedback'));
});
$('songForm').addEventListener('submit', e => {
  e.preventDefault();
  const nombre = $('songName').value.trim();
  const cancion = $('songTitle').value.trim();
  if (!nombre || !cancion) return;
  enviarWhatsApp(`🎵 Hola, soy ${nombre}. Para los XV años de ${CONFIG.nombre} quiero sugerir la canción: *${cancion}*. 🎶`, $('songFeedback'));
});

document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('effects-paused', document.hidden);
  if (document.hidden) detenerMariposasNaturales();
  else reanudarMariposasNaturales();
});


// Cada mariposa recorre una curva cerrada distinta; al girar, orienta el cuerpo
// en la dirección del vuelo. Las alas combinan aleteo y pequeños planeos.
function iniciarMariposasNaturales() {
  const campo = $('welcomeScene');
  const elementos = [...welcome.querySelectorAll('.castle-butterfly')];
  if (!campo || !elementos.length || !window.requestAnimationFrame) return;
  const rutas = [
    [[.10,.18],[.27,.12],[.31,.31],[.19,.42],[.07,.34]],
    [[.86,.19],[.72,.13],[.68,.33],[.82,.42],[.94,.30]],
    [[.13,.62],[.27,.73],[.19,.88],[.06,.77],[.07,.57]],
    [[.87,.61],[.74,.72],[.81,.87],[.95,.76],[.94,.55]],
    [[.42,.13],[.53,.09],[.64,.18],[.54,.28],[.39,.23]],
    [[.44,.83],[.57,.89],[.68,.81],[.59,.73],[.43,.75]]
  ];
  const periodos = [13.8,16.2,15.6,17.8,19.2,18.4];
  const estados = elementos.map((elemento, i) => ({
    elemento, alas:[...elemento.querySelectorAll('.butterfly-wing')],
    ruta:rutas[i % rutas.length], periodo:periodos[i % periodos.length],
    fase:i * 1.37 + .32, faseAla:i * .71, angulo:0, inicializado:false, ancho:0, alto:0, visible:true
  }));
  let anchoCampo = 1, altoCampo = 1;
  ajustarVueloMariposas = () => {
    anchoCampo = campo.clientWidth;
    altoCampo = campo.clientHeight;
    estados.forEach(estado => {
      estado.visible = getComputedStyle(estado.elemento).display !== 'none';
      estado.ancho = estado.elemento.offsetWidth;
      estado.alto = estado.elemento.offsetHeight;
    });
  };
  function puntoCurva(ruta, avance) {
    const longitud = ruta.length;
    const posicion = ((avance % 1) + 1) % 1 * longitud;
    const indice = Math.floor(posicion), u = posicion - indice;
    const a = ruta[(indice - 1 + longitud) % longitud];
    const b = ruta[indice % longitud], c = ruta[(indice + 1) % longitud];
    const d = ruta[(indice + 2) % longitud];
    const punto = [], tangente = [];
    for (let eje = 0; eje < 2; eje++) {
      const q = -a[eje] + c[eje];
      const r = 2*a[eje] - 5*b[eje] + 4*c[eje] - d[eje];
      const s = -a[eje] + 3*b[eje] - 3*c[eje] + d[eje];
      punto[eje] = .5 * (2*b[eje] + q*u + r*u*u + s*u*u*u);
      tangente[eje] = .5 * (q + 2*r*u + 3*s*u*u);
    }
    return {punto,tangente};
  }
  welcome.classList.add('butterflies-natural');
  ajustarVueloMariposas();
  let ultimoTiempo = performance.now(), tiempo = 0, frameId = 0;
  const intervalo = 1000 / (effectsLight ? 24 : 30);
  function dibujar(ahora) {
    frameId = 0;
    if (introFinished || introPhotoStarted || document.hidden) return;
    const transcurrido = ahora - ultimoTiempo;
    if (transcurrido < intervalo - .5) {
      frameId = requestAnimationFrame(dibujar);
      return;
    }
    const paso = Math.min(.1, Math.max(0, transcurrido / 1000));
    ultimoTiempo = ahora - (transcurrido % intervalo);
    if (!document.hidden) {
      tiempo += paso * (reducedMotion ? .38 : 1);
      estados.forEach(estado => {
        if (!estado.visible) return;
        const t = tiempo + estado.fase;
        const avance = t / estado.periodo + .007 * Math.sin(t * .64 + estado.fase);
        const {punto,tangente} = puntoCurva(estado.ruta,avance);
        const objetivo = Math.atan2(tangente[1]*altoCampo,tangente[0]*anchoCampo)*180/Math.PI + 90;
        if (!estado.inicializado) { estado.angulo = (objetivo + 360) % 360; estado.inicializado = true; }
        const giro = (((objetivo - estado.angulo) % 360 + 540) % 360) - 180;
        estado.angulo = (estado.angulo + giro * (1 - Math.exp(-paso * 5)) + 360) % 360;
        const profundidad = .9 + .075*Math.sin(t*.42 + estado.fase);
        const x = punto[0]*anchoCampo - estado.ancho*.5;
        const y = punto[1]*altoCampo - estado.alto*.55 + 1.6*Math.sin(t*7.7);
        estado.elemento.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${estado.angulo.toFixed(2)}deg) scale(${profundidad.toFixed(3)})`;
        const frecuencia = 3.2 + .22*Math.sin(t*.73 + estado.fase);
        estado.faseAla = (estado.faseAla + paso * (reducedMotion ? .38 : 1) * frecuencia * Math.PI * 2) % (Math.PI * 2);
        const pulso = Math.cos(estado.faseAla);
        const batido = .19 + .81*Math.pow((pulso+1)/2,.72);
        const planeo = Math.max(0,(Math.sin(t*.53 + estado.fase)-.965)/.035);
        const apertura = batido + (1-batido)*planeo;
        const inclinacion = Math.max(-.055,Math.min(.055,giro/280));
        estado.alas.forEach((ala,i) => {
          const escala = Math.max(.16,Math.min(1,apertura + (i === 0 ? inclinacion : -inclinacion)));
          ala.style.transform = `scaleX(${escala.toFixed(3)}) rotate(${((1-escala)*5).toFixed(2)}deg)`;
        });
      });
    }
    frameId = requestAnimationFrame(dibujar);
  }
  detenerMariposasNaturales = () => { cancelAnimationFrame(frameId); frameId = 0; };
  reanudarMariposasNaturales = () => {
    if (document.hidden || introPhotoStarted || introFinished || frameId) return;
    ultimoTiempo = performance.now();
    frameId = requestAnimationFrame(dibujar);
  };
  reanudarMariposasNaturales();
}

function iniciarEscenaIntro() {
  function limitarDecoracion(selector, maximo) {
    const elementos = [...welcome.querySelectorAll(selector)];
    const conservar = new Set(Array.from({ length:Math.min(maximo, elementos.length) },
      (_, i) => Math.round(i * (elementos.length - 1) / Math.max(1, maximo - 1))));
    elementos.forEach((elemento, i) => { if (!conservar.has(i)) elemento.remove(); });
  }
  limitarDecoracion('.castle-fall', effectsLight ? 6 : 12);
  limitarDecoracion('.rain-flower', effectsLight ? 8 : 14);
  if (effectsLight) {
    [...welcome.querySelectorAll('.castle-butterfly')].forEach((elemento, i) => {
      if (![0, 1, 4].includes(i)) elemento.remove();
    });
  }
  prepararRecorridoCastillo();
  iniciarMariposasNaturales();
  $('introPortraitImage').decode?.().catch(() => {});
  document.fonts?.ready.then(ajustarEspacioBotonIntro);
  if ('ResizeObserver' in window) {
    observadorEscenaIntro = new ResizeObserver(solicitarAjusteIntro);
    observadorEscenaIntro.observe($('welcomeScene'));
    observadorEscenaIntro.observe(welcome.querySelector('.portal-title'));
    observadorEscenaIntro.observe($('openInvitationBtn'));
  }
}

configurarPagina();
document.body.classList.toggle('effects-paused', document.hidden);
iniciarEscenaIntro();
