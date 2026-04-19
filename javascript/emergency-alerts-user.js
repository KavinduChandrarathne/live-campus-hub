// Type icons and labels
const typeIcons = {
    'fire': '<i class="fa-solid fa-fire"></i>',
    'evacuation': '<i class="fa-solid fa-person-walking"></i>',
    'hazard': '<i class="fa-solid fa-triangle-exclamation"></i>',
    'security': '<i class="fa-solid fa-shield"></i>',
    'flood': '<i class="fa-solid fa-water"></i>',
    'other': '<i class="fa-solid fa-ellipsis"></i>'
};

const typeLabels = {
    'fire': 'Fire',
    'evacuation': 'Evacuation',
    'hazard': 'Dangerous Situation',
    'security': 'Security Incident',
    'flood': 'Flood',
    'other': 'Other'
};

// Load alerts when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadEmergencyAlerts();
    // Refresh every 30 seconds
    setInterval(loadEmergencyAlerts, 30000);
});

// Load emergency alerts from server
async function loadEmergencyAlerts() {
    try {
        const response = await fetch('./Admin/shared/php/get-emergency-alerts.php');
        const result = await response.json();

        if (result.success) {
            const alerts = result.alerts || [];
            displayAlerts(alerts);
        }
    } catch (error) {
        console.error('Error loading emergency alerts:', error);
    }
}

// Display alerts on page
function displayAlerts(alerts) {
    const activeAlertsContainer = document.getElementById('activeAlertsContainer');
    const alertHistoryContainer = document.getElementById('alertHistoryContainer');
    const noActiveAlerts = document.getElementById('noActiveAlerts');
    const historySection = document.getElementById('historySection');

    // Separate active and resolved alerts
    const activeAlerts = alerts.filter(a => a.status === 'active');
    const resolvedAlerts = alerts.filter(a => a.status !== 'active');

    // Clear containers
    activeAlertsContainer.innerHTML = '';
    alertHistoryContainer.innerHTML = '';

    // Display active alerts
    if (activeAlerts.length === 0) {
        noActiveAlerts.style.display = 'block';
        activeAlertsContainer.style.display = 'none';
    } else {
        noActiveAlerts.style.display = 'none';
        activeAlertsContainer.style.display = 'flex';
        activeAlerts.forEach(alert => {
            const card = createAlertCard(alert);
            activeAlertsContainer.appendChild(card);
        });
    }

    // Display resolved alerts
    if (resolvedAlerts.length > 0) {
        historySection.style.display = 'block';
        resolvedAlerts.slice(0, 5).forEach(alert => {
            const card = createResolvedAlertCard(alert);
            alertHistoryContainer.appendChild(card);
        });
    } else {
        historySection.style.display = 'none';
    }
}

// Create active alert card
function createAlertCard(alert) {
    const card = document.createElement('div');
    card.className = `card severity-${alert.severity}`;

    // Calculate time remaining
    const activeUntil = new Date(alert.activeUntil);
    const now = new Date();
    const timeRemaining = activeUntil - now;

    let timeRemainingText = '';
    if (timeRemaining > 0) {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        timeRemainingText = `${hours}h ${minutes}m`;
    } else {
        timeRemainingText = 'Expired';
    }

    const typeIcon = typeIcons[alert.type] || '<i class="fa-solid fa-exclamation-triangle"></i>';
    const typeLabel = typeLabels[alert.type] || 'Alert';

    card.innerHTML = `
        ${typeIcon}
        <h3>${escapeHtml(alert.title)}</h3>
        <p class="location">
            <i class="fa-solid fa-location-dot"></i>
            <strong>${escapeHtml(alert.location)}</strong>
        </p>
        <p class="description">${escapeHtml(alert.description)}</p>
        <div class="instructions">
            <strong>What to do:</strong> ${escapeHtml(alert.instructions)}
        </div>
        <small class="time-remaining">
            <i class="fa-solid fa-hourglass-end"></i> ${timeRemainingText}
        </small>
    `;

    // Add header with type and severity badges after h3
    const h3 = card.querySelector('h3');
    const badgesDiv = document.createElement('div');
    badgesDiv.style.marginTop = '6px';
    badgesDiv.innerHTML = `
        <span class="alert-type">${escapeHtml(typeLabel)}</span>
        <span class="alert-severity">${alert.severity.toUpperCase()}</span>
    `;
    h3.parentNode.insertBefore(badgesDiv, h3.nextSibling);

    return card;
}

// Create resolved alert card
function createResolvedAlertCard(alert) {
    const card = document.createElement('div');
    card.className = 'card resolved';

    const typeIcon = typeIcons[alert.type] || '<i class="fa-solid fa-exclamation-triangle"></i>';
    const typeLabel = typeLabels[alert.type] || 'Alert';

    const resolvedAt = new Date(alert.resolvedAt || alert.activeUntil);
    const formattedDate = resolvedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    card.innerHTML = `
        ${typeIcon}
        <h3>${escapeHtml(alert.title)}</h3>
        <p class="location">${escapeHtml(alert.location)}</p>
        <div style="margin-top: 8px;">
            <span class="alert-type" style="background-color: #ccc; color: #666;">${escapeHtml(typeLabel)}</span>
            <span class="alert-severity">✓ Resolved</span>
        </div>
        <small class="time-remaining">${formattedDate}</small>
    `;

    return card;
}

// Escape HTML to prevent XSS
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
