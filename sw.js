// sw.js - El cerebro en segundo plano
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Escuchar mensajes desde la app (opcional para control futuro)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFICACION') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/1792/1792931.png',
            tag: event.data.tag,
            renotify: true
        });
    }
});