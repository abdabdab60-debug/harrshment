// Service Worker for background monitoring
const CACHE_NAME = 'safeguard-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js'
];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Background monitoring
let monitoringConfig = null;
let isMonitoring = false;

self.addEventListener('message', event => {
    const { type, config } = event.data;
    
    switch (type) {
        case 'START_MONITORING':
            monitoringConfig = config;
            isMonitoring = true;
            startBackgroundMonitoring();
            break;
            
        case 'STOP_MONITORING':
            isMonitoring = false;
            break;
    }
});

function startBackgroundMonitoring() {
    if (!isMonitoring) return;
    
    // Simulate background message monitoring
    setInterval(() => {
        if (!isMonitoring) return;
        
        // In a real implementation, this would:
        // 1. Monitor device messages
        // 2. Process for harassment
        // 3. Send notifications
        // 4. Store alerts
        
        // For demo, occasionally send test notifications
        if (Math.random() < 0.01) { // 1% chance every interval
            self.registration.showNotification('SafeGuard Alert', {
                body: 'Background monitoring detected potential threat',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'background-alert',
                requireInteraction: true,
                actions: [
                    {
                        action: 'view',
                        title: 'View Details'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dismiss'
                    }
                ]
            });
        }
    }, 30000); // Check every 30 seconds
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Sync any pending data when connection is restored
    return Promise.resolve();
}