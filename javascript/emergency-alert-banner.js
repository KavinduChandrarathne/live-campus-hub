// Emergency Alert Banner for User Pages
class EmergencyAlertBanner {
    constructor() {
        this.alertButton = null;
        this.currentAlert = null;
        this.alerts = [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.body) {
            this.createAlertButton();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                this.createAlertButton();
            });
        }
        
        this.loadAlerts();
        // Check for new alerts every 30 seconds
        setInterval(() => this.loadAlerts(), 30000);
    }

    createAlertButton() {
        // Find welcome-right container
        let welcomeRight = document.querySelector('.welcome-right');
        
        if (!welcomeRight) {
            // Try waiting a bit for the DOM to settle
            let attempts = 0;
            const checkInterval = setInterval(() => {
                welcomeRight = document.querySelector('.welcome-right');
                if (welcomeRight && !document.getElementById('emergency-alert-btn')) {
                    clearInterval(checkInterval);
                    this.createButtonElement(welcomeRight);
                }
                attempts++;
                if (attempts > 10) {
                    clearInterval(checkInterval); // Stop checking after 5 seconds
                }
            }, 500);
            return;
        }

        if (!document.getElementById('emergency-alert-btn')) {
            this.createButtonElement(welcomeRight);
        }
    }

    createButtonElement(welcomeRight) {
        const alertBtnContainer = document.createElement('div');
        alertBtnContainer.className = 'alert-button-container';
        alertBtnContainer.innerHTML = `
            <button id="emergency-alert-btn" class="alert-btn" aria-label="Emergency Alerts" title="View Emergency Alerts">
                <i class="fa-solid fa-warning"></i>
                <span class="alert-dot"></span>
            </button>
        `;
        
        // Insert before the profile picture or at the start of welcome-right
        welcomeRight.insertBefore(alertBtnContainer, welcomeRight.firstChild);
        
        this.alertButton = document.getElementById('emergency-alert-btn');
        this.alertButton.addEventListener('click', () => {
            if (this.currentAlert) {
                window.location.href = `alert-details.html?id=${this.currentAlert.id}`;
            }
        });
        
        // Hide button initially
        this.hideButton();
    }

    async loadAlerts() {
        try {
            const response = await fetch('Admin/shared/php/get-emergency-alerts.php');
            const result = await response.json();

            if (result.success && result.alerts && result.alerts.length > 0) {
                this.alerts = result.alerts;
                this.displayAlertButton();
            } else {
                this.hideButton();
            }
        } catch (error) {
            console.error('Error loading emergency alerts:', error);
            this.hideButton();
        }
    }

    displayAlertButton() {
        if (this.alerts.length === 0) {
            this.hideButton();
            return;
        }

        // Get first active alert
        const alert = this.alerts[0];
        this.currentAlert = alert;

        if (!this.alertButton) {
            // Button not created yet, try again
            this.createAlertButton();
            return;
        }

        // Update button with alert info
        const typeIcon = this.getTypeIcon(alert.type);
        this.alertButton.innerHTML = `
            ${typeIcon}
            <span class="alert-dot"></span>
        `;
        this.alertButton.title = `🔴 ${alert.title}`;
        
        // Show button
        this.alertButton.classList.add('show');
    }

    hideButton() {
        if (this.alertButton) {
            this.alertButton.classList.remove('show');
        }
        this.currentAlert = null;
    }

    getTypeIcon(type) {
        const icons = {
            'fire': '<i class="fas fa-fire"></i>',
            'evacuation': '<i class="fas fa-person-running"></i>',
            'hazard': '<i class="fas fa-triangle-exclamation"></i>',
            'security': '<i class="fas fa-shield"></i>',
            'flood': '<i class="fas fa-water"></i>',
            'other': '<i class="fas fa-bell"></i>'
        };
        return icons[type] || icons['other'];
    }

    getTypeLabel(type) {
        const labels = {
            'fire': 'Fire Alert',
            'evacuation': 'Evacuation Alert',
            'hazard': 'Dangerous Situation',
            'security': 'Security Incident',
            'flood': 'Flood Warning',
            'other': 'Emergency Alert'
        };
        return labels[type] || 'Emergency Alert';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new EmergencyAlertBanner();
    });
} else {
    new EmergencyAlertBanner();
}
