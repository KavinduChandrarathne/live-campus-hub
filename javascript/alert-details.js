// Alert Details Page Script

class AlertDetailsManager {
    constructor() {
        this.alert = null;
        this.countdownInterval = null;
        this.init();
    }

    async init() {
        // Get alert ID from URL parameters
        const alertId = this.getAlertIdFromURL();
        if (!alertId) {
            this.showError('No alert ID provided');
            return;
        }

        // Load alert data
        await this.loadAlert(alertId);
        
        // Setup event listeners
        this.setupEventListeners();

        // Initialize user UI if available
        if (typeof initUserUI === 'function') {
            initUserUI();
        }
    }

    getAlertIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async loadAlert(alertId) {
        try {
            const response = await fetch(`Admin/shared/php/get-emergency-alerts.php?id=${encodeURIComponent(alertId)}`);
            const result = await response.json();

            if (result.success && result.alerts && result.alerts.length > 0) {
                this.alert = result.alerts[0];
                this.displayAlert();
                this.startCountdown();
            } else {
                this.showError('Alert not found');
            }
        } catch (error) {
            console.error('Error loading alert:', error);
            this.showError('Failed to load alert details');
        }
    }

    displayAlert() {
        if (!this.alert) return;

        const typeIcon = this.getTypeIcon(this.alert.type);
        const typeLabel = this.getTypeLabel(this.alert.type);

        // Update page title and header
        document.title = `${this.alert.title} | Campus Hub`;
        document.getElementById('alertTitle').textContent = this.alert.title;
        document.getElementById('detailTitle').textContent = this.alert.title;
        document.getElementById('alertIcon').className = typeIcon.replace(/<i class="(.*?)"><\/i>/, '$1');

        // Update main content
        document.getElementById('alertDescription').textContent = this.alert.description || 'No description provided.';
        document.getElementById('alertLocation').textContent = this.alert.location || 'Not specified';
        
        // Format instructions
        if (this.alert.instructions) {
            const instructionLines = this.alert.instructions.split('\n');
            const instructionHTML = instructionLines.map(line => `<p>${line}</p>`).join('');
            document.getElementById('alertInstructions').innerHTML = instructionHTML || 'No specific instructions provided.';
        } else {
            document.getElementById('alertInstructions').innerHTML = '<p>No specific instructions provided.</p>';
        }

        // Update badges
        document.getElementById('alertTypeBadge').textContent = typeLabel;
        document.getElementById('alertSeverityBadge').textContent = this.getSeverityLabel(this.alert.severity);
        document.getElementById('alertSeverityBadge').className = `alert-severity-badge severity-${this.alert.severity}`;

        // Update summary
        document.getElementById('summaryStatus').textContent = this.alert.status === 'active' ? '🔴 Active' : '✓ Resolved';
        document.getElementById('summarySeverity').textContent = this.getSeverityLabel(this.alert.severity);
        document.getElementById('summaryType').textContent = typeLabel;

        // Format dates
        try {
            const createdAt = new Date(this.alert.createdAt);
            const activeUntil = new Date(this.alert.activeUntil);
            const now = new Date();

            if (!isNaN(createdAt.getTime())) {
                document.getElementById('summaryIssuedAt').textContent = this.formatDateTime(createdAt);
                
                // Time active calculation
                const timeActiveMs = now - createdAt;
                const timeActiveDays = Math.floor(timeActiveMs / (1000 * 60 * 60 * 24));
                const timeActiveHours = Math.floor((timeActiveMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const timeActiveMins = Math.floor((timeActiveMs % (1000 * 60 * 60)) / (1000 * 60));
                
                let timeActiveStr = '';
                if (timeActiveDays > 0) timeActiveStr += `${timeActiveDays}d `;
                if (timeActiveHours > 0) timeActiveStr += `${timeActiveHours}h `;
                timeActiveStr += `${timeActiveMins}m`;
                
                document.getElementById('summaryTimeActive').textContent = timeActiveStr;
            } else {
                document.getElementById('summaryIssuedAt').textContent = 'N/A';
                document.getElementById('summaryTimeActive').textContent = 'N/A';
            }

            if (!isNaN(activeUntil.getTime())) {
                document.getElementById('summaryExpiresAt').textContent = this.formatDateTime(activeUntil);
            } else {
                document.getElementById('summaryExpiresAt').textContent = 'N/A';
            }
        } catch (error) {
            console.error('Error formatting dates:', error);
            document.getElementById('summaryIssuedAt').textContent = 'N/A';
            document.getElementById('summaryExpiresAt').textContent = 'N/A';
            document.getElementById('summaryTimeActive').textContent = 'N/A';
        }
    }

    startCountdown() {
        if (!this.alert) return;

        const countdownElement = document.getElementById('countdownTimer');
        if (!countdownElement) return;

        const updateCountdown = () => {
            try {
                const activeUntil = new Date(this.alert.activeUntil);
                const now = new Date();
                const timeRemaining = activeUntil - now;

                if (timeRemaining <= 0) {
                    countdownElement.textContent = '00:00:00';
                    countdownElement.classList.add('expired');
                    if (this.countdownInterval) clearInterval(this.countdownInterval);
                    return;
                }

                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                countdownElement.textContent = formattedTime;
                countdownElement.classList.remove('expired');
            } catch (error) {
                console.error('Error updating countdown:', error);
                countdownElement.textContent = '--:--:--';
            }
        };

        // Initial call
        updateCountdown();

        // Update every second
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    setupEventListeners() {
        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.history.back();
            });
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareAlert());
        }

        // Report button
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => this.reportAlert());
        }

        // Acknowledge button
        const acknowledgeBtn = document.getElementById('acknowledgeBtn');
        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', () => this.acknowledgeAlert());
        }

        // Scroll to top button
        const scrollTopBtn = document.getElementById('scrollTop');
        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollTopBtn.classList.add('show');
                } else {
                    scrollTopBtn.classList.remove('show');
                }
            });

            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    shareAlert() {
        if (!this.alert) return;

        const shareText = `Emergency Alert: ${this.alert.title}\n\nSeverity: ${this.getSeverityLabel(this.alert.severity)}\nLocation: ${this.alert.location}\n\n${this.alert.description}`;

        if (navigator.share) {
            navigator.share({
                title: `Emergency Alert - ${this.alert.title}`,
                text: shareText,
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Alert details copied to clipboard!');
            }).catch(err => {
                console.error('Error copying to clipboard:', err);
                alert('Unable to share alert');
            });
        }
    }

    reportAlert() {
        const reason = prompt('Please describe why you are reporting this alert:');
        if (reason) {
            alert('Thank you for reporting. Your report has been submitted.');
            // TODO: Send report to backend
        }
    }

    acknowledgeAlert() {
        alert('You have acknowledged this alert.');
        // TODO: Send acknowledgement to backend
    }

    formatDateTime(date) {
        if (!date || isNaN(date.getTime())) return 'Invalid date';

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
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

    getSeverityLabel(severity) {
        const labels = {
            'critical': 'Critical',
            'high': 'High',
            'medium': 'Medium',
            'low': 'Low'
        };
        return labels[severity] || 'Unknown';
    }

    showError(message) {
        const mainContent = document.querySelector('.alert-main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="alert-section" style="background-color: #ffebee; border-left-color: #d32f2f;">
                    <h3><i class="fas fa-exclamation-circle"></i> Error</h3>
                    <p>${message}</p>
                    <a href="dashboard.html" style="color: #d32f2f; text-decoration: underline;">Return to Dashboard</a>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AlertDetailsManager();
    });
} else {
    new AlertDetailsManager();
}
