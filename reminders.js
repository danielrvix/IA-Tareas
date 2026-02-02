/* === reminders.js - SISTEMA DE ALERTAS INTELIGENTES === */

let ultimoSegundoProcesado = -1;

// 1. EL MOTOR: Revisión constante
setInterval(() => {
    const ahora = new Date();
    const segundoActual = ahora.getSeconds();

    if (segundoActual !== ultimoSegundoProcesado) {
        ultimoSegundoProcesado = segundoActual;

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
    const fCreacion = t.creada || ahora; 
    
    const tiempoTotal = fVencimiento - fCreacion;
    const tiempoRestante = fVencimiento - ahora;
    const minutosRestantes = Math.floor(tiempoRestante / 60000);
    const minutosRetraso = Math.floor((ahora - fVencimiento) / 60000);

    // --- FASE 1: PREVENTIVOS (Antes del vencimiento) ---
    if (ahora < fVencimiento) {
        
        // REGLA PARA TAREAS CORTAS (Menos de 5 minutos)
        if (tiempoTotal > 0 && tiempoTotal <= 300000) { 
            const porcentajeTranscurrido = Math.floor(((ahora - fCreacion) / tiempoTotal) * 100);
            
            // Advertencia al 50% del tiempo (Ej: a los 30s si dura 1 min)
            if (porcentajeTranscurrido >= 50 && !t.avisoMitadEnviado) {
                enviarNotifSistema(`⚠️ MITAD DE TIEMPO`, `Daniel, vas por el 50% de: ${t.nombre}`);
                marcarAvisoEnviado(t.id, 'avisoMitadEnviado');
            }
            
            // Aviso de "Último Minuto" cuando quede menos de 1 min
            if (minutosRestantes === 0 && !t.avisoFinalEnviado) {
                enviarNotifSistema(`⏳ ¡ÚLTIMO MINUTO!`, `Advertencia: Queda poco para culminar ${t.nombre}`);
                marcarAvisoEnviado(t.id, 'avisoFinalEnviado');
            }
        }
        // Tareas normales/largas: Avisos a los 15 y 5 minutos
        else {
            if ([15, 5].includes(minutosRestantes) && !t['aviso' + minutosRestantes]) {
                enviarNotifSistema(`¡Ya casi!`, `Faltan ${minutosRestantes} min para: ${t.nombre}`);
                marcarAvisoEnviado(t.id, 'aviso' + minutosRestantes);
            }
            // Aviso de 1 minuto para tareas normales
            if (minutosRestantes === 1 && !t.avisoFinalEnviado) {
                enviarNotifSistema(`⏳ ¡ÚLTIMO MINUTO!`, `Culmina ya: ${t.nombre}`);
                marcarAvisoEnviado(t.id, 'avisoFinalEnviado');
            }
        }
    }
    // --- FASE 2: RETRASO (Después del vencimiento) ---
    else {
        if (!t.notificada) {
            enviarNotifSistema(`🚨 TIEMPO AGOTADO`, `HEY Daniel, la tarea "${t.nombre}" ha vencido.`);
            t.notificada = true;
            marcarAvisoEnviado(t.id, 'notificada');
        }

        // Recordatorios de retraso cada 5 min
        if (minutosRetraso > 0 && minutosRetraso % 5 === 0 && !t['retraso' + minutosRetraso]) {
            enviarNotifSistema(`⚠️ RETRASO`, `Llevas ${minutosRetraso} min tarde en: ${t.nombre}`);
            marcarAvisoEnviado(t.id, 'retraso' + minutosRetraso);
        }
    }
}

// ESTA FUNCIÓN ES NECESARIA PARA QUE LAS NOTIFICACIONES NO SE REPITAN
function marcarAvisoEnviado(id, propiedad) {
    const todas = JSON.parse(localStorage.getItem('tasks_data')) || [];
    const index = todas.findIndex(item => item.id === id);
    if (index !== -1) {
        todas[index][propiedad] = true;
        localStorage.setItem('tasks_data', JSON.stringify(todas));
        // Actualizamos la variable global 'tareas' si existe en el contexto
        if (typeof tareas !== 'undefined') {
            const tIdx = tareas.findIndex(item => item.id === id);
            if (tIdx !== -1) tareas[tIdx][propiedad] = true;
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
