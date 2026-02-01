/* === VARIABLES GLOBALES Y ESTADO === */
let usuario = JSON.parse(localStorage.getItem('user_data'));
let tareas = JSON.parse(localStorage.getItem('tasks_data')) || [];
let catSeleccionada = "📚 Estudios";
let filtroActual = "pendientes";

const traducciones = {
    es: {
        titulo: "IA", estado: "Estado", tareas: "Tareas",
        pendientes: "Pendientes", realizadas: "Realizadas", nueva: "Nueva", ajustes: "Ajustes",
        configuracion: "Configuración", cerrarSesion: "CERRAR SESIÓN", btnCrear: "CREAR TAREA 🚀"
    },
    en: {
        titulo: "AI", estado: "Status", tareas: "Tasks",
        pendientes: "Pending", realizadas: "Completed", nueva: "New", ajustes: "Settings",
        configuracion: "Settings", cerrarSesion: "LOG OUT", btnCrear: "CREATE TASK 🚀"
    }
};

/* === UTILIDADES === */
const obtenerEmojiDinamico = (texto) => {
    const t = texto.toLowerCase();
    if (t.includes("estudiar") || t.includes("examen")) return "📖";
    if (t.includes("gym") || t.includes("entrenar")) return "💪";
    if (t.includes("comprar") || t.includes("super")) return "🛒";
    if (t.includes("limpiar") || t.includes("casa")) return "🧹";
    if (t.includes("pago") || t.includes("banco")) return "💰";
    return "✨";
};

const reproducirSonidoExito = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + 0.2);
};

/* === LÓGICA DE PROGRESO === */
const calcularProgreso = (tarea) => {
    if (tarea.done) return 100;
    if (!tarea.creada || tarea.fecha === "S/F") return 0;

    const ahora = new Date().getTime();
    const [y, m, d] = tarea.fecha.split('-').map(Number);
    const [h, min] = tarea.hora.split(':').map(Number);
    const fin = new Date(y, m - 1, d, h, min).getTime();
    const inicio = tarea.creada;

    // Si la hora actual ya pasó el límite
    if (ahora >= fin) return 100;

    const total = fin - inicio;
    const transcurrido = ahora - inicio;

    // Si se creó y vencía en el mismo minuto, evitamos división por cero
    if (total <= 0) return 100;

    let porcentaje = Math.floor((transcurrido / total) * 100);
    return Math.max(0, Math.min(porcentaje, 100)); 
};

/* === RENDERIZADO DE INTERFAZ === */
function aplicarTraduccion(lang) {
    const t = traducciones[lang];
    if (!t) return;
    document.getElementById('app-title').innerText = `${t.titulo}: ${usuario?.nombre || ''}`;
    document.querySelector('[data-filter="pendientes"]').innerText = t.pendientes;
    document.querySelector('[data-filter="realizadas"]').innerText = t.realizadas;
    document.querySelector('.config-title').innerText = t.configuracion;
    document.getElementById('btn-desplegar').innerText = t.btnCrear;
    document.querySelector('.btn-logout').innerText = t.cerrarSesion;
    
    const navSpans = document.querySelectorAll('.nav-item span');
    navSpans[0].innerText = "PANEL";
    navSpans[1].innerText = t.nueva;
    navSpans[2].innerText = t.ajustes;

    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', opciones);
}

/* === FUNCIÓN PARA OBTENER TIEMPO ACTUAL === */
function obtenerTiempoActual() {
    const ahora = new Date();
    
    // Formato YYYY-MM-DD para el input date
    const fechaHoy = ahora.toISOString().split('T')[0];
    
    // Formato HH:MM para el input time
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const horaActual = `${horas}:${minutos}`;

    return { fechaHoy, horaActual };
}

/* === FUNCIÓN DE LIMPIEZA CON TIEMPO ACTUAL === */
function limpiarFormulario() {
    const { fechaHoy, horaActual } = obtenerTiempoActual();
    
    const inputNombre = document.getElementById('val1');
    const inputFecha = document.getElementById('val-f');
    const inputHora = document.getElementById('input-hora');

    if (inputNombre) inputNombre.value = "";
    if (inputFecha) inputFecha.value = fechaHoy;
    
    if (inputHora) {
        inputHora.value = horaActual;
        // IMPORTANTE: Aseguramos que se vea siempre
        inputHora.style.display = 'block'; 
    }
}
/* === TU FUNCIÓN RENDER MODIFICADA === */
function renderTareas() {
    const lista = document.getElementById('lista-tareas');
    const filtradas = tareas.filter(t => filtroActual === "pendientes" ? !t.done : t.done);
    
    // Actualizar HUD (Esto no causa parpadeo)
    document.getElementById('count-display').innerText = tareas.filter(t => !t.done).length;
    document.getElementById('status-display').innerText = tareas.some(t => !t.done) ? 'ACTIVO' : 'STANDBY';

    // OPTIMIZACIÓN: Si el número de tareas cambió, redibujamos todo una vez
    if (lista.children.length !== filtradas.length) {
        lista.innerHTML = '';
        if (filtradas.length === 0) {
            lista.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top:40px;">No hay tareas en esta sección</p>`;
            return;
        }
    }

    filtradas.forEach((t, index) => {
        const progreso = calcularProgreso(t);
        let colorBarra = '#10b981'; 
        if (progreso > 45 && progreso <= 75) colorBarra = '#f1c40f'; 
        else if (progreso > 75) colorBarra = '#eb4d4b';

        // Intentar buscar si la card ya existe en el DOM
        let card = document.querySelector(`[data-id="${t.id}"]`);

        if (!card) {
            // Si no existe, la creamos (solo la primera vez)
            card = document.createElement('div');
            card.className = `task-card ${t.done ? 'done' : ''}`;
            card.setAttribute('data-id', t.id);
            lista.appendChild(card);
        }

        // Actualizamos SOLO el contenido interno, sin borrar el contenedor
        // Esto evita que la animación de entrada de la "task-card" se reinicie
        card.innerHTML = `
            <div onclick="verDetalles(${t.id})" style="flex:1; cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b>${t.nombre}</b>
                    <small style="opacity:0.6;">${t.hora}</small>
                </div>
                <small style="color:var(--muted);">${t.cat}</small>
                
                ${!t.done && t.fecha !== "S/F" ? `
                    <div class="progress-container" style="background: rgba(0,0,0,0.05); height: 6px; border-radius: 10px; margin-top: 10px; overflow: hidden;">
                        <div class="progress-bar ${progreso >= 90 ? 'pulse-urgent' : ''}" 
                             style="width: ${progreso}%; 
                                    background: ${colorBarra}; 
                                    height: 100%; 
                                    transition: width 1s linear, background 0.5s ease;">
                        </div>
                    </div>
                ` : ''}
            </div>
            ${!t.done ? `
                <button onclick="completar(${t.id})" style="border:none; background:none; font-size:1.6rem; cursor:pointer; margin-left:15px;">
                    ✅
                </button>
            ` : ''}
        `;

        // Lógica de alerta (se mantiene igual)
        if (progreso >= 100 && !t.done && !t.notificada) {
            dispararAlertaIA(t.nombre);
            t.notificada = true; 
            localStorage.setItem('tasks_data', JSON.stringify(tareas));
        }
    });
}

// Escuchar el cambio de sección para resetear con el tiempo actual
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const destino = btn.getAttribute('data-sec');
        // Siempre limpiamos y actualizamos la hora al movernos
        if (destino !== 'sec-nueva') {
            limpiarFormulario();
        }
    });
});
const renderHistorial = () => {
    const contenedor = document.getElementById('lista-historial');
    const logs = JSON.parse(localStorage.getItem('notif_logs')) || [];
    contenedor.innerHTML = '';

    if (logs.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top:30px;">No hay registros recientes.</p>`;
        return;
    }

    logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'task-card'; 
        div.style.borderLeft = '4px solid #eb4d4b';
        div.style.cursor = 'pointer';
        
        const tareaExistente = tareas.find(t => t.nombre.includes(log.tarea));
        const tareaId = tareaExistente ? tareaExistente.id : null;

        div.onclick = () => tareaId ? verDetalles(tareaId) : alert("Tarea no encontrada.");

        div.innerHTML = `
            <div style="flex:1">
                <small style="color:#eb4d4b; font-weight:bold;">⚠️ ALERTA EMITIDA</small>
                <b>${log.tarea}</b><br>
                <small>${log.fecha} • Retraso: ${log.retraso}</small>
            </div>
        `;
        contenedor.appendChild(div);
    });
};

/* === FUNCIONES DE ACCIÓN (WINDOW) === */
window.abrirHistorialDesdeHeader = function() {
    document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none');
    document.getElementById('sec-historial').style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    renderHistorial();
};

window.completar = (id) => {
    reproducirSonidoExito();
    if(typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#00d2ff', '#3a7bd5', '#10b981', '#ffffff'] });
    }
    tareas = tareas.map(t => t.id === id ? { ...t, done: true } : t);
    localStorage.setItem('tasks_data', JSON.stringify(tareas));
    setTimeout(() => renderTareas(), 400);
};

window.eliminarTarea = (id) => {
    if(confirm("¿Eliminar esta tarea definitivamente?")) {
        tareas = tareas.filter(t => t.id !== id);
        localStorage.setItem('tasks_data', JSON.stringify(tareas));
        cerrarDetalles();
        renderTareas();
    }
};

window.verDetalles = (id) => {
    const t = tareas.find(x => x.id === id);
    if(!t) return;

    document.getElementById('det-titulo').innerText = t.nombre;
    document.getElementById('det-cat').innerText = t.cat;
    document.getElementById('det-extra').innerText = `Fecha: ${t.fecha}`;
    document.getElementById('det-hora').innerText = t.hora;
    
    const btnFinalizar = document.getElementById('btn-finalizar-modal');
    const btnEliminar = document.getElementById('btn-eliminar-modal');
    
    btnFinalizar.style.display = t.done ? 'none' : 'block';
    btnFinalizar.onclick = () => { completar(t.id); cerrarDetalles(); };
    btnEliminar.onclick = () => eliminarTarea(id);

    document.getElementById('modal-detalles').style.display = 'flex';
};

window.cerrarDetalles = () => document.getElementById('modal-detalles').style.display = 'none';

window.limpiarHistorial = () => {
    if(confirm("¿Vaciar historial?")) {
        localStorage.setItem('notif_logs', JSON.stringify([]));
        renderHistorial();
    }
};

window.cerrarSesion = () => {
    if(confirm("¿Cerrar sesión? Se borrarán los datos.")) {
        localStorage.clear();
        location.reload();
    }
};

/* === INICIALIZACIÓN === */
/* === INICIALIZACIÓN CORREGIDA === */
function init() {
    if (!usuario) {
        document.getElementById('welcome-overlay').style.display = 'flex';
    } else {
        document.getElementById('welcome-overlay').style.display = 'none';
        document.getElementById('user-full-name').innerText = `${usuario.nombre} ${usuario.apellido}`;
        const lang = localStorage.getItem('idioma') || 'es';
        aplicarTraduccion(lang);
    }

    // Configuración Notificaciones
// Dentro de la función init()
const checkNotif = document.getElementById('check-notifications');
if (checkNotif) {
    // Cargar estado guardado
    checkNotif.checked = localStorage.getItem('notif_enabled') === 'true';

    checkNotif.addEventListener('change', (e) => {
        const activado = e.target.checked;
        
        if (activado) {
            // Si intenta activar, solicitamos permiso al sistema (Windows/Android)
            if (!("Notification" in window)) {
                alert("Este navegador no soporta notificaciones de escritorio.");
                checkNotif.checked = false;
                return;
            }

            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    localStorage.setItem('notif_enabled', 'true');
                    // Notificación de prueba para confirmar
                    new Notification("🚀 Sistema IA", {
                        body: "¡Perfecto! Las notificaciones están activas.",
                        icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png"
                    });
                } else {
                    // Si el usuario deniega el permiso en Windows
                    alert("No podremos avisarte si los permisos están bloqueados en el sistema.");
                    localStorage.setItem('notif_enabled', 'false');
                    checkNotif.checked = false;
                }
            });
        } else {
            // Si desactiva el switch
            localStorage.setItem('notif_enabled', 'false');
        }
    });
}

    // Campos dinámicos iniciales
    const camposDinamicos = document.getElementById('campos-dinamicos');
    if (camposDinamicos) {
        camposDinamicos.innerHTML = `
            <label class="field-label">Tarea / Tema</label><input type="text" id="val1" placeholder="Ej: Entregar proyecto">
            <label class="field-label">Fecha</label><input type="date" id="val-f">`;
        
        // Seteamos fecha de hoy de una vez
        document.getElementById('val-f').value = new Date().toISOString().split('T')[0];
    }

    // === ELIMINADO EL EVENTO DE CHECK-HORA QUE ROMPÍA TODO ===

    // Crear Tarea con validación obligatoria
    const btnDesplegar = document.getElementById('btn-desplegar');
    if (btnDesplegar) {
        btnDesplegar.addEventListener('click', () => {
            const inputNombre = document.getElementById('val1'); 
            const inputFecha = document.getElementById('val-f');
            const inputHora = document.getElementById('input-hora');

            if (!inputNombre || !inputNombre.value.trim()) return alert("Escribe el nombre de la tarea");
            if (!inputHora.value) return alert("La hora es obligatoria");

            const nuevaTarea = {
                id: Date.now(),
                nombre: `${obtenerEmojiDinamico(inputNombre.value)} ${inputNombre.value}`,
                fecha: inputFecha.value || new Date().toISOString().split('T')[0],
                cat: catSeleccionada,
                hora: inputHora.value,
                done: false,
                creada: new Date().getTime(),
                notificada: false
            };

            tareas.push(nuevaTarea);
            localStorage.setItem('tasks_data', JSON.stringify(tareas));

            // Resetear a valores actuales
            const { fechaHoy, horaActual } = obtenerTiempoActual();
            inputNombre.value = "";
            inputFecha.value = fechaHoy;
            inputHora.value = horaActual;

            renderTareas();
            document.querySelector('[data-sec="sec-panel"]').click();
        });
    }

    // Navegación Corregida
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const secId = btn.getAttribute('data-sec');
            
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none');
            const seccionActiva = document.getElementById(secId);
            if (seccionActiva) seccionActiva.style.display = 'block';

            if (secId === 'sec-nueva') {
                const { fechaHoy, horaActual } = obtenerTiempoActual();
                const inputHora = document.getElementById('input-hora');
                const inputFecha = document.getElementById('val-f');
                if (inputHora) inputHora.value = horaActual;
                if (inputFecha) inputFecha.value = fechaHoy;
            }
        });
    });

    // Filtros e Idioma
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filtroActual = e.target.getAttribute('data-filter');
            renderTareas();
        });
    });

    const selectIdioma = document.getElementById('select-idioma');
    if (selectIdioma) {
        selectIdioma.addEventListener('change', (e) => {
            localStorage.setItem('idioma', e.target.value);
            aplicarTraduccion(e.target.value);
        });
    }

    document.querySelectorAll('.cat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            catSeleccionada = chip.getAttribute('data-value');
        });
    });

    const btnIniciar = document.getElementById('btn-iniciar');
    if (btnIniciar) {
        btnIniciar.addEventListener('click', () => {
            const n = document.getElementById('setup-nombre').value;
            const a = document.getElementById('setup-apellido').value;
            if (n && a) {
                usuario = { nombre: n, apellido: a };
                localStorage.setItem('user_data', JSON.stringify(usuario));
                init();
            }
        });
    }

    renderTareas();
}

setInterval(() => {
    tareas.forEach(t => {
        if (!t.done) gestionarAlertasInteligentes(t);
    });
    
    // Si estás en el panel, actualiza las barras visuales
    const secPanel = document.getElementById('sec-panel');
    if (secPanel && secPanel.style.display !== 'none') {
        renderTareas(); 
    }
}, 1000); // Revisión cada segundo

/* === SISTEMA DE ALERTAS IA === */
window.window.dispararAlertaIA = function(tituloTarea) {
    // 1. Alerta visual dentro de la App (lo que ya tenías)
    const toast = document.createElement('div');
    toast.className = 'ia-toast show';
    toast.innerHTML = `
        <div class="ia-toast-icon">⚠️</div>
        <div class="ia-toast-content">
            <b>ALERTA DE SISTEMA</b>
            <span>La tarea "${tituloTarea}" está por vencer.</span>
        </div>
    `;
    document.body.appendChild(toast);

    // 2. ALERTA NATIVA DE WINDOWS (Sonará y aparecerá en el centro de actividades)
    if (Notification.permission === "granted") {
        new Notification("⚠️ IA TAREAS - ALERTA", {
            body: `Hey, la tarea "${tituloTarea}" ya llegó a su límite.`,
            icon: "https://cdn-icons-png.flaticon.com/512/559/559384.png", // Un icono de alerta
            vibrate: [200, 100, 200]
        });
    }

    // 3. Guardar en Historial
    const logs = JSON.parse(localStorage.getItem('notif_logs')) || [];
    logs.unshift({
        tarea: tituloTarea,
        fecha: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        retraso: "Crítico"
    });
    localStorage.setItem('notif_logs', JSON.stringify(logs.slice(0, 15)));

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 600);
    }, 6000);
};

// Arrancar
init();