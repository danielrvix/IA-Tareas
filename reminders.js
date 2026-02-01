// ... (Tus funciones 1, 2 y 3 se mantienen igual)

// 4. Bucle de revisión cada segundo
// 4. Bucle de revisión cada segundo
setInterval(() => {
    const notifHabilitada = localStorage.getItem('notif_enabled') === 'true';
    if (!notifHabilitada) return;

    const lista = JSON.parse(localStorage.getItem('tasks_data')) || [];
    const ahora = new Date();

    lista.forEach(t => {
        // Ahora t.hora siempre existe, así que el código es más limpio
        if (!t.done && t.fecha !== "S/F" && t.hora) {
            const [y, m, d] = t.fecha.split('-').map(Number);
            const [h, min] = t.hora.split(':').map(Number);
            
            const fTarea = new Date(y, m - 1, d, h, min);

            // Si ya pasó la hora y estamos en el segundo 0 del minuto actual
            if (ahora > fTarea && ahora.getSeconds() === 0) {
                const diff = Math.floor((ahora - fTarea) / 60000);
                let txt = diff >= 1440 ? `${Math.floor(diff/1440)}d` : 
                          diff >= 60 ? `${Math.floor(diff/60)}h` : `${diff}m`;
                
                enviarNotificacionSistema(t, txt);
            }
        }
    });
}, 1000);

// Optimización de la revisión de proximidad
const revisarProximidad = (tarea) => {
    if (tarea.done || tarea.fecha === "S/F") return;

    const [y, m, d] = tarea.fecha.split('-').map(Number);
    const fechaTarea = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizamos hoy a medianoche
    
    const diferenciaDias = Math.ceil((fechaTarea - hoy) / (1000 * 60 * 60 * 24));

    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
        if (diferenciaDias <= 1 && diferenciaDias >= 0) {
            statusDisplay.innerText = "ATENCIÓN: PRÓXIMO";
            statusDisplay.style.color = "#f1c40f"; 
        }
    }
};

// Variable para evitar notificaciones duplicadas en el mismo segundo
let ultimaNotifId = null;

const gestionarAlertasInteligentes = (t) => {
    if (t.done) return;

    const ahora = new Date().getTime();
    const [y, m, d] = t.fecha.split('-').map(Number);
    const [h, min] = t.hora.split(':').map(Number);
    const fVencimiento = new Date(y, m - 1, d, h, min).getTime();
    const fCreacion = t.creada;
    
    const tiempoTotal = fVencimiento - fCreacion;
    const tiempoRestante = fVencimiento - ahora;
    const minutosRestantes = Math.floor(tiempoRestante / 60000);
    const minutosRetraso = Math.floor((ahora - fVencimiento) / 60000);

    // --- FASE 1: ANTES DEL VENCIMIENTO (PREVENTIVOS) ---
    if (minutosRestantes > 0) {
        // Tareas largas (más de 24h): Avisar 3 veces al día (cada 8 horas aprox)
        if (tiempoTotal > 86400000) {
            if (minutosRestantes % 480 === 0 && ahora.getSeconds() === 0) {
                enviarNotifSistema(`Recordatorio diario`, `Hey, aún tienes tiempo para: ${t.nombre}`);
            }
        } 
        // Tareas medianas (entre 1h y 24h): Avisar cada 2 horas
        else if (tiempoTotal > 3600000) {
            if (minutosRestantes % 120 === 0 && ahora.getSeconds() === 0) {
                enviarNotifSistema(`Faltan pocas horas`, `No olvides tu tarea: ${t.nombre}`);
            }
        }
        // Tareas cortas (menos de 1h): Avisar cuando falten 15, 5 y 1 minuto
        else {
            if ([15, 5, 1].includes(minutosRestantes) && ahora.getSeconds() === 0) {
                enviarNotifSistema(`¡Ya casi!`, `Faltan ${minutosRestantes} min para: ${t.nombre}`);
            }
        }
    }

    // --- FASE 2: DESPUÉS DEL VENCIMIENTO (RETRASO) ---
    else {
        // Alerta inmediata de "TIEMPO AGOTADO" (la primera vez)
        if (!t.notificada) {
            enviarNotifSistema(`🚨 TIEMPO AGOTADO`, `Hey, la tarea "${t.nombre}" ha vencido.`);
            t.notificada = true;
            localStorage.setItem('tasks_data', JSON.stringify(tareas));
        }

        // Recordatorios de retraso constantes:
        // Cada 5 minutos durante la primera hora, luego cada 30 minutos
        if (minutosRetraso > 0 && ahora.getSeconds() === 0) {
            if (minutosRetraso <= 60 && minutosRetraso % 5 === 0) {
                enviarNotifSistema(`⚠️ RETRASO`, `Llevas ${minutosRetraso} min tarde en: ${t.nombre}`);
            } else if (minutosRetraso > 60 && minutosRetraso % 30 === 0) {
                enviarNotifSistema(`🔴 MUY ATRASADO`, `Llevas ${Math.floor(minutosRetraso/60)}h de retraso.`);
            }
        }
    }
};

// Función auxiliar para disparar la notificación nativa
function enviarNotifSistema(titulo, mensaje) {
    if (localStorage.getItem('notif_enabled') === 'true' && Notification.permission === "granted") {
        new Notification(titulo, {
            body: mensaje,
            icon: "https://cdn-icons-png.flaticon.com/512/559/559384.png"
        });
        // Sonido de alerta
        if (typeof sonidoAlertaWindows === "function") sonidoAlertaWindows();
    }
}