// DOM Elements
const alertForm = document.getElementById('alertForm');
const alertSeverityButtons = document.querySelectorAll('.severity-btn');
const dropdownToggle = document.getElementById('dropdownToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
const dropdownItems = document.querySelectorAll('.dropdown-item');
const alertTypeInput = document.getElementById('alertType');
const alertSeverityInput = document.getElementById('alertSeverity');
const activeAlertsContainer = document.getElementById('activeAlerts');
const noAlertsMessage = document.getElementById('noAlerts');

// Type Icons Map
const typeIcons = {
    'fire': '<i class="fa-solid fa-fire"></i>',
    'evacuation': '<i class="fa-solid fa-person-walking"></i>',
    'hazard': '<i class="fa-solid fa-triangle-exclamation"></i>',
    'security': '<i class="fa-solid fa-shield"></i>',
    'flood': '<i class="fa-solid fa-water"></i>',
    'other': '<i class="fa-solid fa-ellipsis"></i>'
};

// Type Labels
const typeLabels = {
    'fire': 'Fire',
    'evacuation': 'Evacuation',
    'hazard': 'Dangerous Situation',
    'security': 'Security Incident',
    'flood': 'Flood',
    'other': 'Other'
};

let activeAlerts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupTypeDropdown();
    setupSeverityButtons();
    setupFormSubmit();
    setupCancelButton();
    loadActiveAlerts();
    // Refresh alerts every 30 seconds
    setInterval(loadActiveAlerts, 30000);
});

// Mobile Menu
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const layout = document.querySelector('.layout');
    const backdrop = document.getElementById('mobileBackdrop');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            layout.classList.toggle('show-sidebar');
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            layout.classList.remove('show-sidebar');
        });
    }
}

// Setup Type Dropdown
function setupTypeDropdown() {
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownMenu.classList.toggle('active');
        dropdownToggle.classList.toggle('active');
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const value = item.dataset.value;
            const icon = item.querySelector('i').outerHTML;
            const text = item.querySelector('span').textContent;

            // Update hidden input
            alertTypeInput.value = value;

            // Update button display
            dropdownToggle.innerHTML = `${icon}<span>${text}</span><i class="fa-solid fa-chevron-down"></i>`;

            // Update active state
            dropdownItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Close dropdown
            dropdownMenu.classList.remove('active');
            dropdownToggle.classList.remove('active');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const customDropdown = document.querySelector('.custom-dropdown');
        if (!customDropdown.contains(e.target)) {
            dropdownMenu.classList.remove('active');
            dropdownToggle.classList.remove('active');
        }
    });
}

// Setup Severity Button Selection
function setupSeverityButtons() {
    alertSeverityButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alertSeverityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            alertSeverityInput.value = btn.dataset.severity;
        });
    });
}

// Setup Form Submit
function setupFormSubmit() {
    alertForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const title = document.getElementById('alertTitle').value.trim();
        const type = document.getElementById('alertType').value;
        const location = document.getElementById('alertLocation').value.trim();
        const description = document.getElementById('alertDescription').value.trim();
        const severity = document.getElementById('alertSeverity').value;
        const instructions = document.getElementById('alertInstructions').value.trim();
        const activeUntil = document.getElementById('alertDuration').value;

        // Validation
        if (!title || !location || !description || !instructions || !activeUntil) {
            showErrorMessage('Please fill in all required fields');
            return;
        }

        const alertData = {
            title,
            type,
            location,
            description,
            severity,
            instructions,
            activeUntil: new Date(activeUntil).toISOString(),
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        try {
            // Send to server
            const response = await fetch('../Admin/shared/php/add-emergency-alert.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(alertData)
            });

            const result = await response.json();

            if (result.success) {
                // Show success message
                showSuccessMessage('Alert published successfully!');
                // Reset form
                alertForm.reset();
                // Reset severity buttons to default
                alertSeverityButtons.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-severity="critical"]').classList.add('active');
                
                // Reload active alerts
                loadActiveAlerts();
            } else {
                showErrorMessage(result.message || 'Failed to publish alert');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage('Error publishing alert: ' + error.message);
        }
    });
}

// Setup Cancel Button
function setupCancelButton() {
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            alertForm.reset();
            alertSeverityButtons.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-severity="critical"]').classList.add('active');
            alertSeverityInput.value = 'critical';
        });
    }
}

// Load Active Alerts
async function loadActiveAlerts() {
    try {
        const response = await fetch('../Admin/shared/php/get-emergency-alerts.php');
        const result = await response.json();

        if (result.success) {
            activeAlerts = result.alerts || [];
            displayActiveAlerts();
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Display Active Alerts
function displayActiveAlerts() {
    activeAlertsContainer.innerHTML = '';
    
    if (activeAlerts.length === 0) {
        noAlertsMessage.style.display = 'block';
        activeAlertsContainer.style.display = 'none';
        return;
    }

    noAlertsMessage.style.display = 'none';
    activeAlertsContainer.style.display = 'flex';

    activeAlerts.forEach(alert => {
        const alertCard = createAlertCard(alert);
        activeAlertsContainer.appendChild(alertCard);
    });
}

// Create Alert Card
function createAlertCard(alert) {
    const card = document.createElement('div');
    card.className = 'alert-item';
    
    // Calculate time remaining
    const activeUntil = new Date(alert.activeUntil);
    const now = new Date();
    const timeRemaining = activeUntil - now;
    
    let timeRemainingText = '';
    if (timeRemaining > 0) {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        timeRemainingText = `${hours}h ${minutes}m remaining`;
    } else {
        timeRemainingText = 'Expired';
    }

    const typeIcon = typeIcons[alert.type] || '<i class="fa-solid fa-exclamation-triangle"></i>';
    const typeLabel = typeLabels[alert.type] || 'Alert';

    const iconClass = alert.type === 'hazard' ? 'hazard' : alert.type;

    card.innerHTML = `
        <div class="alert-icon ${iconClass}">
            ${typeIcon}
        </div>
        <div class="alert-content">
            <div class="alert-header">
                <div class="alert-title">${escapeHtml(alert.title)}</div>
                <div class="alert-badge ${alert.severity}">${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</div>
            </div>
            <div class="alert-location">📍 ${escapeHtml(alert.location)} (${escapeHtml(typeLabel)})</div>
            <div class="alert-description">${escapeHtml(alert.description)}</div>
            <div class="alert-instructions">
                <strong>Instructions:</strong> ${escapeHtml(alert.instructions)}
            </div>
            <div class="alert-meta">Expires in: ${timeRemainingText}</div>
        </div>
        <div class="alert-actions">
            <button class="mini edit" onclick="editAlert('${alert.id}')" title="Edit">
                <i class="fa-solid fa-edit"></i>
            </button>
            <button class="mini resolve" onclick="resolveAlert('${alert.id}')" title="Resolve">
                <i class="fa-solid fa-check"></i>
            </button>
            <button class="mini delete" onclick="deleteAlert('${alert.id}')" title="Delete">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    return card;
}

// Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Edit Alert
async function editAlert(alertId) {
    const alert = activeAlerts.find(a => a.id === alertId);
    if (!alert) return;

    // Populate form with alert data
    document.getElementById('alertTitle').value = alert.title;
    document.getElementById('alertLocation').value = alert.location;
    document.getElementById('alertDescription').value = alert.description;
    document.getElementById('alertInstructions').value = alert.instructions;
    document.getElementById('alertDuration').value = alert.activeUntil.replace('Z', '');

    // Set type using dropdown
    alertTypeInput.value = alert.type;
    const typeItem = document.querySelector(`[data-value="${alert.type}"]`);
    if (typeItem) {
        const icon = typeItem.querySelector('i').outerHTML;
        const text = typeItem.querySelector('span').textContent;
        dropdownToggle.innerHTML = `${icon}<span>${text}</span><i class="fa-solid fa-chevron-down"></i>`;
        
        dropdownItems.forEach(i => i.classList.remove('active'));
        typeItem.classList.add('active');
    }

    // Set severity
    alertSeverityButtons.forEach(b => b.classList.remove('active'));
    const severityBtn = document.querySelector(`[data-severity="${alert.severity}"]`);
    if (severityBtn) severityBtn.classList.add('active');
    alertSeverityInput.value = alert.severity;

    // Scroll to form
    const formPanel = document.querySelector('.form-section');
    if (formPanel) {
        formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Delete Alert
async function deleteAlert(alertId) {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
        const response = await fetch('../Admin/shared/php/delete-emergency-alert.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: alertId })
        });

        const result = await response.json();

        if (result.success) {
            showSuccessMessage('Alert deleted successfully!');
            loadActiveAlerts();
        } else {
            showErrorMessage(result.message || 'Failed to delete alert');
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('Error deleting alert: ' + error.message);
    }
}

// Resolve Alert
async function resolveAlert(alertId) {
    try {
        const response = await fetch('../Admin/shared/php/resolve-emergency-alert.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: alertId })
        });

        const result = await response.json();

        if (result.success) {
            showSuccessMessage('Alert marked as resolved!');
            loadActiveAlerts();
        } else {
            showErrorMessage(result.message || 'Failed to resolve alert');
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('Error resolving alert: ' + error.message);
    }
}

// Show Success Message
function showSuccessMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);

    setTimeout(() => msgDiv.remove(), 4000);
}

// Show Error Message
function showErrorMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);

    setTimeout(() => msgDiv.remove(), 4000);
}
