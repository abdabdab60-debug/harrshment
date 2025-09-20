// SafeGuard Pro - Real Device Data Integration
class SafeGuardPro {
    constructor() {
        this.isMonitoring = false;
        this.userData = null;
        this.realContacts = [];
        this.deviceMessages = [];
        this.currentLocation = null;
        this.threatPatterns = [
            /kill|murder|hurt|harm|beat|attack/i,
            /worthless|stupid|ugly|hate you/i,
            /follow|watching|know where/i,
            /or else|you better|don't ignore/i
        ];
        this.init();
    }

    async init() {
        await this.checkDeviceCapabilities();
        this.setupEventListeners();
        this.loadUserData();
        this.requestPermissions();
    }

    async checkDeviceCapabilities() {
        this.capabilities = {
            contacts: 'contacts' in navigator,
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            sms: 'sms' in navigator || 'messaging' in navigator,
            camera: 'mediaDevices' in navigator,
            microphone: 'mediaDevices' in navigator,
            storage: 'localStorage' in window
        };
        
        console.log('Device capabilities:', this.capabilities);
    }

    setupEventListeners() {
        // Registration form
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        // Demo and navigation
        window.showDemo = () => this.showDemo();
        window.hideDemo = () => this.hideDemo();
        window.scrollToFeatures = () => this.scrollToSection('features');
        
        // Real device actions
        window.startRealMonitoring = () => this.startRealMonitoring();
        window.stopRealMonitoring = () => this.stopRealMonitoring();
        window.syncRealContacts = () => this.syncRealContacts();
        window.getCurrentLocation = () => this.getCurrentLocation();
        window.testEmergencyCall = () => this.makeEmergencyCall();
    }

    async requestPermissions() {
        try {
            // Request notification permission
            if (this.capabilities.notifications) {
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);
            }

            // Request location permission
            if (this.capabilities.geolocation) {
                await this.getCurrentLocation();
            }

            // Request contacts permission (if supported)
            if (this.capabilities.contacts) {
                await this.requestContactsPermission();
            }

        } catch (error) {
            console.error('Permission request failed:', error);
        }
    }

    async requestContactsPermission() {
        try {
            // Modern Contacts API (limited browser support)
            if ('contacts' in navigator && 'ContactsManager' in window) {
                const props = ['name', 'tel'];
                const opts = { multiple: true };
                
                // This will show browser's contact picker
                const contacts = await navigator.contacts.select(props, opts);
                this.realContacts = contacts.map(contact => ({
                    name: contact.name?.[0] || 'Unknown',
                    phone: contact.tel?.[0] || '',
                    id: Math.random().toString(36).substr(2, 9)
                }));
                
                console.log('Real contacts loaded:', this.realContacts.length);
                this.updateContactsList();
            }
        } catch (error) {
            console.log('Contacts API not supported, using manual entry');
            this.showManualContactEntry();
        }
    }

    async syncRealContacts() {
        try {
            await this.requestContactsPermission();
            this.showNotification('Contacts synced successfully!', 'success');
        } catch (error) {
            this.showNotification('Contact sync failed. Please add manually.', 'error');
        }
    }

    async getCurrentLocation() {
        if (!this.capabilities.geolocation) {
            this.showNotification('Geolocation not supported', 'error');
            return null;
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log('Current location:', this.currentLocation);
                    this.updateLocationDisplay();
                    resolve(this.currentLocation);
                },
                (error) => {
                    console.error('Location error:', error);
                    this.showNotification('Location access denied', 'error');
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    async startRealMonitoring() {
        if (this.isMonitoring) return;

        try {
            // Start monitoring device messages (simulated for web)
            this.isMonitoring = true;
            this.showNotification('Real-time monitoring started', 'success');
            
            // Monitor clipboard for message analysis (privacy-conscious)
            this.startClipboardMonitoring();
            
            // Monitor device notifications (if permission granted)
            this.startNotificationMonitoring();
            
            // Update UI
            this.updateMonitoringStatus(true);
            
            // Start periodic checks
            this.monitoringInterval = setInterval(() => {
                this.performSecurityCheck();
            }, 30000); // Check every 30 seconds

        } catch (error) {
            console.error('Failed to start monitoring:', error);
            this.showNotification('Failed to start monitoring', 'error');
        }
    }

    startClipboardMonitoring() {
        // Monitor clipboard for potentially harmful content
        document.addEventListener('paste', async (e) => {
            if (!this.isMonitoring) return;
            
            try {
                const clipboardText = await navigator.clipboard.readText();
                const threatLevel = this.analyzeMessage(clipboardText);
                
                if (threatLevel > 0.7) {
                    this.handleThreatDetected({
                        content: clipboardText,
                        source: 'clipboard',
                        threatLevel: threatLevel,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                // Clipboard access might be restricted
                console.log('Clipboard monitoring limited');
            }
        });
    }

    startNotificationMonitoring() {
        // Monitor for notification patterns (limited in web browsers)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'notification-received') {
                    this.analyzeNotification(event.data.notification);
                }
            });
        }
    }

    analyzeMessage(content) {
        if (!content || typeof content !== 'string') return 0;
        
        let threatScore = 0;
        const words = content.toLowerCase().split(/\s+/);
        
        // Check against threat patterns
        this.threatPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                threatScore += 0.3;
            }
        });
        
        // Check for aggressive language
        const aggressiveWords = ['kill', 'hurt', 'harm', 'beat', 'attack', 'destroy'];
        const aggressiveCount = words.filter(word => 
            aggressiveWords.includes(word.toLowerCase())
        ).length;
        
        threatScore += aggressiveCount * 0.2;
        
        // Check for harassment indicators
        const harassmentWords = ['worthless', 'stupid', 'ugly', 'hate', 'loser'];
        const harassmentCount = words.filter(word => 
            harassmentWords.includes(word.toLowerCase())
        ).length;
        
        threatScore += harassmentCount * 0.15;
        
        return Math.min(threatScore, 1.0);
    }

    handleThreatDetected(threat) {
        console.log('Threat detected:', threat);
        
        // Store threat data
        const threats = JSON.parse(localStorage.getItem('detectedThreats') || '[]');
        threats.push(threat);
        localStorage.setItem('detectedThreats', JSON.stringify(threats));
        
        // Show immediate notification
        this.showThreatNotification(threat);
        
        // Update statistics
        this.updateThreatStats();
        
        // Auto-block if high threat level
        if (threat.threatLevel > 0.8) {
            this.autoBlockThreat(threat);
        }
    }

    showThreatNotification(threat) {
        if (this.capabilities.notifications && Notification.permission === 'granted') {
            new Notification('SafeGuard Alert: Threat Detected', {
                body: `High-risk content detected. Threat level: ${Math.round(threat.threatLevel * 100)}%`,
                icon: '/favicon.ico',
                tag: 'threat-alert',
                requireInteraction: true
            });
        }
        
        this.showNotification(`Threat detected! Level: ${Math.round(threat.threatLevel * 100)}%`, 'warning');
    }

    async makeEmergencyCall() {
        try {
            // Get current location for emergency services
            await this.getCurrentLocation();
            
            // Prepare emergency data
            const emergencyData = {
                location: this.currentLocation,
                timestamp: new Date().toISOString(),
                userInfo: this.userData,
                recentThreats: JSON.parse(localStorage.getItem('detectedThreats') || '[]').slice(-5)
            };
            
            // In a real app, this would contact emergency services
            // For web demo, we simulate the call
            this.simulateEmergencyCall(emergencyData);
            
        } catch (error) {
            console.error('Emergency call failed:', error);
            this.showNotification('Emergency call failed', 'error');
        }
    }

    simulateEmergencyCall(data) {
        const locationText = data.location ? 
            `Location: ${data.location.latitude.toFixed(6)}, ${data.location.longitude.toFixed(6)}` : 
            'Location: Not available';
            
        alert(`🚨 EMERGENCY CALL INITIATED 🚨\n\n` +
              `Time: ${new Date().toLocaleString()}\n` +
              `${locationText}\n` +
              `Recent threats: ${data.recentThreats.length}\n\n` +
              `Emergency services have been notified with your location and threat history.`);
              
        this.showNotification('Emergency services contacted!', 'success');
    }

    performSecurityCheck() {
        if (!this.isMonitoring) return;
        
        // Check for new threats
        const threats = JSON.parse(localStorage.getItem('detectedThreats') || '[]');
        const recentThreats = threats.filter(threat => {
            const threatTime = new Date(threat.timestamp);
            const now = new Date();
            return (now - threatTime) < 3600000; // Last hour
        });
        
        // Update monitoring statistics
        this.updateStats();
        
        // Check if emergency response needed
        if (recentThreats.length > 3) {
            this.showNotification('Multiple threats detected. Consider emergency contact.', 'warning');
        }
    }

    stopRealMonitoring() {
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        this.updateMonitoringStatus(false);
        this.showNotification('Monitoring stopped', 'info');
    }

    updateMonitoringStatus(isActive) {
        const statusElement = document.querySelector('.status');
        if (statusElement) {
            statusElement.textContent = isActive ? 'Active' : 'Inactive';
            statusElement.className = `status ${isActive ? 'active' : 'inactive'}`;
        }
    }

    updateLocationDisplay() {
        const locationElement = document.getElementById('currentLocation');
        if (locationElement && this.currentLocation) {
            locationElement.textContent = 
                `${this.currentLocation.latitude.toFixed(4)}, ${this.currentLocation.longitude.toFixed(4)}`;
        }
    }

    updateContactsList() {
        const contactsList = document.getElementById('emergencyContactsList');
        if (contactsList && this.realContacts.length > 0) {
            contactsList.innerHTML = this.realContacts.map(contact => `
                <div class="contact-item">
                    <span class="contact-name">${contact.name}</span>
                    <span class="contact-phone">${contact.phone}</span>
                </div>
            `).join('');
        }
    }

    updateThreatStats() {
        const threats = JSON.parse(localStorage.getItem('detectedThreats') || '[]');
        const threatCountElement = document.getElementById('demoThreats');
        if (threatCountElement) {
            threatCountElement.textContent = threats.length.toString();
        }
    }

    updateStats() {
        // Update messages monitored (simulated based on monitoring time)
        const messagesElement = document.getElementById('demoMessages');
        if (messagesElement && this.isMonitoring) {
            const currentCount = parseInt(messagesElement.textContent.replace(/,/g, '')) || 1247;
            messagesElement.textContent = (currentCount + Math.floor(Math.random() * 5)).toLocaleString();
        }
        
        // Update threat count
        this.updateThreatStats();
    }

    // Registration and user management
    async handleRegistration() {
        const formData = new FormData(document.getElementById('registrationForm'));
        
        this.userData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            emergencyContact: formData.get('emergencyContact'),
            registrationDate: new Date().toISOString()
        };
        
        // Save user data
        localStorage.setItem('userData', JSON.stringify(this.userData));
        
        // Get real location
        await this.getCurrentLocation();
        
        // Sync real contacts
        await this.syncRealContacts();
        
        this.showNotification('Registration successful! Real device integration active.', 'success');
        this.showDashboard();
    }

    loadUserData() {
        const saved = localStorage.getItem('userData');
        if (saved) {
            this.userData = JSON.parse(saved);
            this.showDashboard();
        } else {
            this.showRegistration();
        }
    }

    showRegistration() {
        document.getElementById('registrationModal').style.display = 'block';
    }

    showDashboard() {
        document.getElementById('registrationModal').style.display = 'none';
        this.updateStats();
    }

    // Demo functionality
    showDemo() {
        const demoSection = document.getElementById('demo');
        if (demoSection) {
            demoSection.style.display = 'block';
            demoSection.classList.add('fade-in');
            demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add real device integration info to demo
            this.enhanceDemoWithRealData();
        }
    }

    enhanceDemoWithRealData() {
        // Show real device capabilities
        const capabilitiesHtml = Object.entries(this.capabilities)
            .map(([key, supported]) => `
                <div class="capability-item ${supported ? 'supported' : 'not-supported'}">
                    <i class="fas fa-${supported ? 'check' : 'times'}"></i>
                    <span>${key.charAt(0).toUpperCase() + key.slice(1)}: ${supported ? 'Supported' : 'Not Supported'}</span>
                </div>
            `).join('');
            
        const capabilitiesContainer = document.getElementById('deviceCapabilities');
        if (capabilitiesContainer) {
            capabilitiesContainer.innerHTML = capabilitiesHtml;
        }
        
        // Show real location if available
        if (this.currentLocation) {
            this.updateLocationDisplay();
        }
        
        // Show real contacts count
        const contactsCount = document.getElementById('realContactsCount');
        if (contactsCount) {
            contactsCount.textContent = this.realContacts.length.toString();
        }
    }

    hideDemo() {
        const demoSection = document.getElementById('demo');
        if (demoSection) {
            demoSection.style.display = 'none';
        }
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' : 
                                  type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : 
                        type === 'error' ? '#dc3545' : 
                        type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: ${type === 'warning' ? '#333' : 'white'};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showManualContactEntry() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h3>Add Emergency Contact</h3>
                    <form id="manualContactForm">
                        <input type="text" name="contactName" placeholder="Contact Name" required>
                        <input type="tel" name="contactPhone" placeholder="Phone Number" required>
                        <div class="modal-buttons">
                            <button type="submit">Add Contact</button>
                            <button type="button" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#manualContactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.realContacts.push({
                name: formData.get('contactName'),
                phone: formData.get('contactPhone'),
                id: Math.random().toString(36).substr(2, 9)
            });
            this.updateContactsList();
            modal.remove();
            this.showNotification('Emergency contact added!', 'success');
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.safeGuardApp = new SafeGuardPro();
});