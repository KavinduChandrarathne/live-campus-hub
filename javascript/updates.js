// updates.js - Load updates for users

document.addEventListener('DOMContentLoaded', function() {
    loadFacilityUpdates();
    loadClubUpdates();
});

// Function to load facility and event updates
function loadFacilityUpdates() {
    fetch('/api/facility-updates')
        .then(response => response.json())
        .then(result => {
            const data = result.success ? result.data : [];
            const container = document.getElementById('facility-feed');
            container.innerHTML = ''; // Clear existing

            // Sort by datetime descending (newest first)
            data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

            if (data.length === 0) {
                container.innerHTML = '<p>No facility updates available.</p>';
                return;
            }

            data.forEach(update => {
                const box = createUpdateBox(update);
                container.appendChild(box);
            });
        })
        .catch(error => {
            console.error('Error loading facility updates:', error);
            document.getElementById('facility-feed').innerHTML = '<p>Error loading updates.</p>';
        });
}

// Function to load club updates (filtered for user's clubs)
function loadClubUpdates() {
    const user = getCurrentUser();
    if (!user) return;

    // Refresh session user data to ensure joinedClubs is accurate
    refreshCurrentUser().then(freshUser => {
        const memberClubs = new Set();
        if (freshUser && Array.isArray(freshUser.joinedClubs)) {
            freshUser.joinedClubs.forEach(c => {
                if (typeof c === 'string' && c.trim()) {
                    memberClubs.add(c.trim().toLowerCase());
                }
            });
        }

        const token = sessionStorage.getItem('authToken');
        if (!token) {
            document.getElementById('club-feed').innerHTML = '<p>Authentication required to load club updates.</p>';
            return;
        }

        fetch(`/api/club-updates?studentId=${encodeURIComponent(freshUser.studentId)}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => response.json())
            .then(result => {
                const updates = result.success ? result.data : [];
                const container = document.getElementById('club-feed');
                container.innerHTML = ''; // Clear existing

                if (updates.length === 0) {
                    container.innerHTML = '<p>No club updates available for your clubs.</p>';
                    return;
                }

                updates.forEach(update => {
                    const box = createUpdateBox(update);
                    container.appendChild(box);
                });
            })
            .catch(error => {
                console.error('Error loading club updates:', error);
                document.getElementById('club-feed').innerHTML = '<p>Error loading updates.</p>';
            });
    });
}

// Function to create update box
function createUpdateBox(update) {
    const div = document.createElement('div');
    div.className = 'update-box';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'update-box-icon';
    const icon = document.createElement('i');
    icon.className = `fa-solid ${update.icon || 'fa-envelope'}`;
    iconDiv.appendChild(icon);

    const h3 = document.createElement('h3');
    h3.textContent = update.clubName ? `${update.clubName}: ${update.message}` : update.message;

    const p = document.createElement('p');
    p.textContent = update.description || '';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'update-date';
    dateSpan.textContent = formatDateTime(update.datetime);

    div.appendChild(iconDiv);
    div.appendChild(h3);
    div.appendChild(p);
    div.appendChild(dateSpan);

    return div;
}

// Function to format datetime
function formatDateTime(datetime) {
    if (!datetime) return '';
    const date = new Date(datetime);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return 'Today ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days === 1) {
        return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
}