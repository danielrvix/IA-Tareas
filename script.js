document.addEventListener('DOMContentLoaded', () => {
  // === CONFIGURACIÓN DE WHATSAPP ===
  const WHATSAPP_NUMBER = "584264744951";

  // === 1. MENÚ HAMBURGUESA ===
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');

      const icon = hamburgerBtn.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      }
    });

    // Cerrar el menú al hacer clic en cualquier enlace
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburgerBtn.querySelector('i');
        if (icon) {
          icon.className = 'fa-solid fa-bars';
        }
      });
    });
  }

  // === 2. REPORTE DE EMERGENCIA VÍA WHATSAPP CON UBICACIÓN GPS ===
  const reportBtn = document.getElementById('reportEmergencyBtn');

  if (reportBtn) {
    reportBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const fallbackMessage = encodeURIComponent("🚨 *SOLICITUD DE EMERGENCIA - PROTECCIÓN CIVIL* 🚨\n\nNecesito asistencia en mi ubicación.");

      if (navigator.geolocation) {
        const originalText = reportBtn.innerText;
        reportBtn.innerText = "Obteniendo ubicación...";

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const message = `🚨 *SOLICITUD DE EMERGENCIA - PROTECCIÓN CIVIL* 🚨\n\nNecesito asistencia en mi ubicación actual:\nhttps://maps.google.com/?q=${lat},${lon}`;
            const encodedMessage = encodeURIComponent(message);

            reportBtn.innerText = originalText;
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
          },
          (error) => {
            reportBtn.innerText = originalText;
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${fallbackMessage}`, '_blank');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${fallbackMessage}`, '_blank');
      }
    });
  }

  // === 3. SLIDER HERO & NAVEGACIÓN TECLADO ===
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentSlide = 0;
  let autoSlideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    if (slides.length > 0) {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }
  }

  function prevSlide() {
    if (slides.length > 0) {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    }
  }

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoSlide();
    });
  }

  // Navegación por teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoSlide();
    }
  });

  function startAutoSlide() {
    if (slides.length > 0) {
      autoSlideInterval = setInterval(nextSlide, 6000);
    }
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  startAutoSlide();
});
