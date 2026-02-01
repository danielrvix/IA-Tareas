/* === reminders.js - SISTEMA DE ALERTAS INTELIGENTES === */

// Variable de control
let ultimoSegundoProcesado = -1;

// 1. EL MOTOR: Revisión constante
setInterval(() => {
    const ahora = new Date();
    const segundoActual = ahora.getSeconds();

    if (segundoActual !== ultimoSegundoSegundoProcesado) {
        ultimoSegundoProcesado = segundoActual;

        // Extraer tareas del storage
        const tareasParaRevisar = JSON.parse(localStorage.getItem('tasks_data')) || [];

        tareasParaRevisar.forEach(t => {
            if (!t.done) {
                gestionarAlertasInteligentes(t);
            }
        });
    }
}, 1000);

// 2. LA LÓGICA: ¿Cuándo avisar?
function gestionarAlertasInteligentes(t) {
    if (t.done) return;

    const ahora = new Date().getTime();
    const [y, m, d] = t.fecha.split('-').map(Number);
    const [h, min] = t.hora.split(':').map(Number);
    const fVencimiento = new Date(y, m - 1, d, h, min).getTime();
    const fCreacion = t.creada || ahora; // Fallback por si no tiene fecha de creación
    
    const tiempoTotal = fVencimiento - fCreacion;
    const tiempoRestante = fVencimiento - ahora;
    const minutosRestantes = Math.floor(tiempoRestante / 60000);
    const minutosRetraso = Math.floor((ahora - fVencimiento) / 60000);

    // --- FASE 1: PREVENTIVOS (Antes del rojo) ---
    if (minutosRestantes > 0) {
        if (tiempoTotal > 86400000) { // +24h
            if (minutosRestantes % 480 === 0 && new Date().getSeconds() === 0) {
                enviarNotifSistema(`Recordatorio diario`, `HEY, aún tienes tiempo para: ${t.nombre}`);
            }
        } 
        else if (tiempoTotal > 3600000) { // 1h a 24h
            if (minutosRestantes % 120 === 0 && new Date().getSeconds() === 0) {
                enviarNotifSistema(`Faltan pocas horas`, `No olvides tu tarea: ${t.nombre}`);
            }
        }
        else { // Tareas cortas
            if ([15, 5, 1].includes(minutosRestantes) && new Date().getSeconds() === 0) {
                enviarNotifSistema(`¡Ya casi!`, `Faltan ${minutosRestantes} min para: ${t.nombre}`);
            }
        }
    }
    // --- FASE 2: RETRASO (Después del rojo) ---
    else {
        if (!t.notificada) {
            enviarNotifSistema(`🚨 TIEMPO AGOTADO`, `HEY, la tarea "${t.nombre}" ha vencido.`);
            t.notificada = true;
            // Actualizamos el storage para marcarla como notificada
            const todas = JSON.parse(localStorage.getItem('tasks_data')) || [];
            const index = todas.findIndex(item => item.id === t.id);
            if (index !== -1) {
                todas[index].notificada = true;
                localStorage.setItem('tasks_data', JSON.stringify(todas));
            }
        }

        if (minutosRetraso > 0 && new Date().getSeconds() === 0) {
            if (minutosRetraso <= 60 && minutosRetraso % 5 === 0) {
                enviarNotifSistema(`⚠️ RETRASO`, `Llevas ${minutosRetraso} min tarde en: ${t.nombre}`);
            } else if (minutosRetraso > 60 && minutosRetraso % 30 === 0) {
                enviarNotifSistema(`🔴 MUY ATRASADO`, `Llevas ${Math.floor(minutosRetraso/60)}h de retraso.`);
            }
        }
    }
}

// 3. LA SALIDA: Notificación y Sonido
function enviarNotifSistema(titulo, mensaje) {
    const habilitado = localStorage.getItem('notif_enabled') === 'true';
    if (habilitado && Notification.permission === "granted") {
        new Notification(titulo, {
            body: mensaje,
            icon: "https://cdn-icons-png.flaticon.com/512/559/559384.png"
        });
        sonidoAlertaWindows();
    }
}

function sonidoAlertaWindows() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch(e) { console.log("Audio bloqueado"); }
}