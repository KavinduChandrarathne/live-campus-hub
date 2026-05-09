// Load updates on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFacilityUpdates();
    loadClubUpdates();
});

// Function to load facility and event updates
function loadFacilityUpdates() {
    const token = localStorage.getItem('adminAuthToken');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    fetch('../api/facility-updates', { headers })
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
                const card = createUpdateCard(update, 'facility');
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading facility updates:', error);
            document.getElementById('facility-feed').innerHTML = '<p>Error loading updates.</p>';
        });
}

// Function to load club updates (all for admin)
function loadClubUpdates() {
    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
        document.getElementById('club-feed').innerHTML = '<p>Admin authentication required.</p>';
        return;
    }
    fetch('../api/club-updates', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => response.json())
        .then(result => {
            const data = result.success ? result.data : [];
            const container = document.getElementById('club-feed');
            container.innerHTML = ''; // Clear existing

            // Sort by datetime descending (newest first)
            data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

            if (data.length === 0) {
                container.innerHTML = '<p>No club updates available.</p>';
                return;
            }

            data.forEach(update => {
                const card = createUpdateCard(update, 'club');
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading club updates:', error);
            document.getElementById('club-feed').innerHTML = '<p>Error loading updates.</p>';
        });
}

// Function to create update card
function createUpdateCard(update, type) {
    const article = document.createElement('article');
    article.className = 'feed-card';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'feed-icon';
    const icon = document.createElement('i');
    icon.className = `fa-solid ${update.icon || 'fa-envelope'}`;
    iconDiv.appendChild(icon);

    const textDiv = document.createElement('div');
    textDiv.className = 'feed-text';
    const h3 = document.createElement('h3');
    // Always show club name (for club updates) so it is easy to recognize
    if (type === 'club' && update.clubName) {
      h3.textContent = `${update.clubName}: ${update.message || ''}`.trim();
    } else {
      h3.textContent = update.message || '';
    }
    const p = document.createElement('p');
    p.textContent = update.description || '';
    textDiv.appendChild(h3);
    textDiv.appendChild(p);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'feed-actions';
    const editBtn = document.createElement('button');
    editBtn.className = 'mini edit';
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'mini delete';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'feed-time';
    timeDiv.textContent = formatDateTime(update.datetime);

    article.appendChild(iconDiv);
    article.appendChild(textDiv);
    article.appendChild(actionsDiv);
    article.appendChild(timeDiv);

    // Add event listeners for edit/delete (demo for now)
    editBtn.addEventListener('click', () => {
        alert('Edit functionality not implemented yet.');
    });
    deleteBtn.addEventListener('click', () => {
        article.remove();
    });

    return article;
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

// Sidebar toggle for mobile
const hamburger = document.getElementById("hamburger");
const mobileBackdrop = document.getElementById("mobileBackdrop");
const layout = document.querySelector(".layout");

if (hamburger && mobileBackdrop && layout) {
  hamburger.addEventListener("click", () => {
    layout.classList.toggle("show-sidebar");
  });

  mobileBackdrop.addEventListener("click", () => {
    layout.classList.remove("show-sidebar");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") layout.classList.remove("show-sidebar");
  });
}