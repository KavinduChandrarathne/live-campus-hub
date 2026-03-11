// common.js - Utilities for pages that need user information

function getCurrentUser() {
    const raw = sessionStorage.getItem('currentUser');
    if (!raw) {
        // user not logged in, redirect to login
        window.location.href = 'index.html';
        return null;
    }
    try {
        const user = JSON.parse(raw);
        // asynchronously refresh the session user from authoritative JSON
        fetch('Admin/shared/json/users.json')
            .then(r => r.json())
            .then(users => {
                const updated = users.find(u => u.username === user.username || u.email === user.email);
                if (updated) {
                    sessionStorage.setItem('currentUser', JSON.stringify(updated));
                }
            })
            .catch(() => { /* ignore failures */ });
        return user;
    } catch (e) {
        console.error('Failed to parse currentUser from sessionStorage', e);
        window.location.href = 'index.html';
        return null;
    }
}

function populateSidebar(user) {
    if (!user) return;
    const pic = user.picture || './images/naveen.png';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const email = user.email || '';
    
    const imgEl = document.getElementById('sidebar-picture');
    if (imgEl) imgEl.src = pic;
    
    const nameEl = document.getElementById('sidebar-name');
    if (nameEl) nameEl.textContent = name || 'User Name';
    
    const emailEl = document.getElementById('sidebar-email');
    if (emailEl) emailEl.textContent = email || 'user@email.com';
}

function initUserUI() {
    const user = getCurrentUser();
    if (!user) return;
    
    populateSidebar(user);
    
    const welcomeNameEl = document.getElementById('welcome-name');
    if (welcomeNameEl) welcomeNameEl.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    
    const welcomePic = document.getElementById('welcome-picture');
    if (welcomePic) welcomePic.src = user.picture || './images/naveen.png';
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize dropdown functionality for all pages
function initDropdown() {
    // ...dropdown logic removed...
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initUserUI();
    initDropdown();
});