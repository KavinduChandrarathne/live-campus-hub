// common.js - Utilities for pages that need user information

let _userRefreshPromise = null;
let _lastRefresh = 0;
const REFRESH_INTERVAL = 10000; // don't refresh more often than every 10s

function getCurrentUser() {
    const raw = sessionStorage.getItem('currentUser');
    if (!raw) {
        window.location.href = 'index.html';
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to parse currentUser from sessionStorage', e);
        window.location.href = 'index.html';
        return null;
    }
}

/**
 * Force-refreshes the session user from the JSON file.  Returns a promise
 * that resolves with the updated user.  Multiple simultaneous calls
 * will share the same in-flight fetch.  Refreshes are throttled.
 */
function refreshCurrentUser() {
    const now = Date.now();
    if (_userRefreshPromise && now - _lastRefresh < REFRESH_INTERVAL) {
        return _userRefreshPromise;
    }

    _lastRefresh = now;
    // add timestamp to prevent aggressive browser caching
    _userRefreshPromise = fetch('Admin/shared/json/users.json?t=' + Date.now())
        .then(r => r.json())
        .then(users => {
            const existing = getCurrentUser();
            if (!existing) return null;
            const updated = users.find(u => u.username === existing.username || u.email === existing.email);
            if (updated) {
                sessionStorage.setItem('currentUser', JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: updated }));
                return updated;
            }
            return existing;
        })
        .catch(err => {
            console.warn('refreshCurrentUser failed', err);
            return getCurrentUser();
        })
        .finally(() => {
            // clear promise after a short delay to allow repeat refreshes
            setTimeout(() => { _userRefreshPromise = null; }, 1000);
        });
    return _userRefreshPromise;
}

// convenience helper that returns a promise resolving to the freshest user data.
function getCurrentUserAsync() {
    const current = getCurrentUser();
    return refreshCurrentUser().then(u => u || current);
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