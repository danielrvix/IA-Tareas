document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentSlide = 0;
  let autoSlideInterval;

  // Función para cambiar de diapositiva
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  // Eventos de los botones
  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoSlide();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoSlide();
  });

  // Navegación con teclado (Flecha Izquierda / Derecha)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoSlide();
    }
    if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoSlide();
    }
  });

  // Transición automática cada 6 segundos
  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 6000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // Iniciar carrusel automático
  startAutoSlide();
});

document.addEventListener('DOMContentLoaded', () => {
  // Lógica del menú hamburguesa
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const icon = hamburgerBtn.querySelector('i');

  hamburgerBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    // Cambiar icono entre barra y equis (X)
    if (navLinks.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });

  // Cerrar el menú al hacer clic en un enlace
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    });
  });

  // --- Lógica existente del Slider ---
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
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoSlide();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoSlide();
  });

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 6000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  startAutoSlide();
});

document.addEventListener('DOMContentLoaded', () => {
  // === CONFIGURACIÓN DE WHATSAPP ===
  // Escribe aquí tu número con el código de país (Ejemplo: 584120000000)
  const WHATSAPP_NUMBER = "584264744951";

  // === MENÚ HAMBURGUESA ===
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const icon = hamburgerBtn ? hamburgerBtn.querySelector('i') : null;

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // === REPORTE DE EMERGENCIA VÍA WHATSAPP CON UBICACIÓN ===
  const reportBtn = document.getElementById('reportEmergencyBtn');

  if (reportBtn) {
    reportBtn.addEventListener('click', () => {
      // Verificar si el navegador soporta Geolocalización
      if (navigator.geolocation) {
        // Notificación visual rápida de carga opcional
        const originalText = reportBtn.innerText;
        reportBtn.innerText = "Obteniendo ubicación...";

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Crear el mensaje automático predeterminado
            const message = `🚨 *SOLICITUD DE EMERGENCIA - PROTECCIÓN CIVIL* 🚨\n\nNecesito asistencia en mi ubicación actual:\nhttps://maps.google.com/?q=${lat},${lon}`;
            
            // Codificar el texto para la URL de WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

            reportBtn.innerText = originalText;
            // Abrir WhatsApp en una pestaña nueva o directamente en la app
            window.open(whatsappUrl, '_blank');
          },
          (error) => {
            reportBtn.innerText = originalText;
            alert("No se pudo obtener la ubicación GPS automática. Se abrirá WhatsApp para que envíes el reporte.");
            
            const fallbackMessage = encodeURIComponent("🚨 *SOLICITUD DE EMERGENCIA - PROTECCIÓN CIVIL* 🚨\n\nSolicito asistencia inmediata en mi zona.");
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${fallbackMessage}`, '_blank');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        alert("Tu navegador no soporta geolocalización. Abriendo WhatsApp...");
        const fallbackMessage = encodeURIComponent("🚨 *SOLICITUD DE EMERGENCIA - PROTECCIÓN CIVIL* 🚨\n\nSolicito asistencia inmediata.");
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${fallbackMessage}`, '_blank');
      }
    });
  }

  // === SLIDER HERO ===
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