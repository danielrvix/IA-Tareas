document.addEventListener('DOMContentLoaded', () => {
  // NÚMERO DE WHATSAPP INSTITUCIONAL
  const WHATSAPP_NUMBER = "584264744951";

  // ELEMENTOS DEL MODAL TIPO FACEBOOK
  const fbModalOverlay = document.getElementById('fbModalOverlay');
  const closeFbModalBtn = document.getElementById('closeFbModalBtn');
  const reportEmergencyNav = document.getElementById('reportEmergencyNav');
  const floatEmergencyBtn = document.getElementById('floatEmergencyBtn');
  const getGpsBtn = document.getElementById('getGpsBtn');
  const gpsStatusBadge = document.getElementById('gpsStatusBadge');
  const locationDetailsText = document.getElementById('locationDetailsText');
  const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');
  const incidentChips = document.querySelectorAll('.incident-chip');
  const incidentDetails = document.getElementById('incidentDetails');

  let currentGpsData = null;
  let selectedIncidentType = "Accidente de Tránsito";

  // ABRIR Y CERRAR MODAL
  function openModal() {
    fbModalOverlay.classList.add('active');
  }

  function closeModal() {
    fbModalOverlay.classList.remove('active');
  }

  if (reportEmergencyNav) reportEmergencyNav.addEventListener('click', openModal);
  if (floatEmergencyBtn) floatEmergencyBtn.addEventListener('click', openModal);
  if (closeFbModalBtn) closeFbModalBtn.addEventListener('click', closeModal);

  fbModalOverlay.addEventListener('click', (e) => {
    if (e.target === fbModalOverlay) closeModal();
  });

  // SELECCIÓN DE TIPO DE INCIDENCIA
  incidentChips.forEach(chip => {
    chip.addEventListener('click', () => {
      incidentChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedIncidentType = chip.getAttribute('data-type');
    });
  });

  // CAPTURA DE UBICACIÓN GPS DEL NAVEGADOR
  getGpsBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      gpsStatusBadge.className = "gps-status error";
      gpsStatusBadge.innerText = "GPS no soportado";
      locationDetailsText.innerText = "Tu navegador no permite captura automática. Usa la guía de abajo para enviarla manualmente.";
      return;
    }

    gpsStatusBadge.className = "gps-status";
    gpsStatusBadge.innerText = "Obteniendo datos...";
    getGpsBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        const accuracy = Math.round(position.coords.accuracy);

        currentGpsData = { lat, lon, link: `https://maps.google.com/?q=${lat},${lon}` };

        gpsStatusBadge.className = "gps-status success";
        gpsStatusBadge.innerText = "GPS Capturado";
        locationDetailsText.innerHTML = `<strong>Coordenadas:</strong> ${lat}, ${lon}<br><small style="color:#28a745;">Precisión estimada: ~${accuracy} metros.</small>`;
        getGpsBtn.disabled = false;
      },
      (error) => {
        gpsStatusBadge.className = "gps-status error";
        gpsStatusBadge.innerText = "Permiso denegado / Error";
        locationDetailsText.innerText = "No se pudo obtener el GPS automático. Por favor sigue los pasos para enviarla desde WhatsApp.";
        getGpsBtn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

  // CONSTRUIR Y ENVIAR REPORTE VÍA WHATSAPP
  sendWhatsappBtn.addEventListener('click', () => {
    const obs = incidentDetails.value.trim();
    let message = `🚨 *REPORTE DE EMERGENCIA - PROTECCIÓN CIVIL* 🚨\n\n`;
    message += `📌 *Tipo de Evento:* ${selectedIncidentType}\n`;
    
    if (obs !== "") {
      message += `📝 *Detalles:* ${obs}\n`;
    }

    if (currentGpsData) {
      message += `📍 *Ubicación GPS:* ${currentGpsData.link}\n`;
    } else {
      message += `📍 *Ubicación GPS:* (Enviando ubicación precisa en tiempo real desde el chat)\n`;
    }

    message += `\n⚠️ *Por favor, despachen unidad de atención.*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    closeModal();
  });

  // MENÚ HAMBURGUESA
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }

  // SLIDER HERO
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  }

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    });
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    });
  }
});
