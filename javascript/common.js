// This is for utilities for pages that need user information

let _userRefreshPromise = null;
let _lastRefresh = 0;
const REFRESH_INTERVAL = 10000; 



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
 * Force-refreshes the session user from the database API.  Returns a promise
 * that resolves with the updated user.  Multiple simultaneous calls
 * will share the same in-flight fetch.  Refreshes are throttled.
 */
function refreshCurrentUser() {
    const now = Date.now();
    if (_userRefreshPromise && now - _lastRefresh < REFRESH_INTERVAL) {
        return _userRefreshPromise;
    }

    _lastRefresh = now;
    const existing = getCurrentUser();
    if (!existing || !existing.email) {
        return Promise.resolve(existing);
    }

    // fetch from database API endpoint instead of JSON file
    _userRefreshPromise = fetch('Admin/shared/php/api-get-user.php?email=' + encodeURIComponent(existing.email))
        .then(r => r.json())
        .then(updated => {
            if (updated && updated.email) {
                sessionStorage.setItem('currentUser', JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: updated }));
                return updated;
            }
            return existing;
        })
        .catch(err => {
            console.warn('refreshCurrentUser failed', err);
            return existing;
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

function showToast(message, type = 'success') {
    let toast = document.getElementById('rewardToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'rewardToast';
        toast.className = 'reward-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'reward-toast show ' + type;
    setTimeout(() => {
        toast.className = 'reward-toast';
    }, 2600);
}

function updateCurrentUserInSession(updatedUser) {
    if (!updatedUser) return;
    const current = getCurrentUser();
    if (!current) return;
    const merged = Object.assign({}, current, updatedUser);
    sessionStorage.setItem('currentUser', JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: merged }));
}

function getTierBadgePath(tier) {
    const tierMap = {
        'BRONZE': 'images/bronze.png',
        'SILVER': 'images/silver.png',
        'GOLD': 'images/gold.png',
        'DIAMOND': 'images/diamond.png',
        'PLATINUM': 'images/platinum.png'
    };
    return tierMap[(tier || '').toUpperCase()] || tierMap['BRONZE'];
}

function setTierBadge(tier) {
    if (!tier) return;
    const img = document.getElementById('tierBadge');
    if (img) img.src = getTierBadgePath(tier);
    const dashImg = document.getElementById('dash-tier-badge');
    if (dashImg) dashImg.src = getTierBadgePath(tier);
}

function awardEngagementPoints(points, reason) {
    const user = getCurrentUser();
    if (!user || !user.email) return;
    const body = new URLSearchParams();
    body.append('email', user.email);
    body.append('action', 'usage');
    body.append('points', points);

    fetch('Admin/shared/php/update-user-rewards.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    }).then(r => r.json()).then(result => {
        if (result.success && result.user) {
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
            showToast(result.message || `+${points} points ${reason}`, 'success');
            // Dispatch reward update event for reactive UI
            window.dispatchEvent(new CustomEvent('rewardsUpdated', { detail: result.user.rewards }));
            // Also dispatch the general update
            window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: result.user }));
        } else if (result.error) {
            showToast(result.error, 'error');
        }
    }).catch(err => {
        console.error('Engagement reward failed', err);
    });
}

function initRewardsTracking() {
    const user = getCurrentUser();
    if (!user) return;

    let meaningfulClickCount = 0;
    let lastClickKey = '';
    let lastClickTime = 0;
    let activeSeconds = 0;
    let lastActivityTime = Date.now();

    const processClick = (e) => {
        const el = e.target.closest('a, button, .club-card, .route-card, .update-card');
        if (!el) return;

        const identifier = el.dataset.rewardId || el.id || (el.textContent || '').trim().substring(0, 40);
        const now = Date.now();
        if (identifier === lastClickKey && now - lastClickTime < 1000) {
            return; // ignore rapid repeated click on same element
        }
        lastClickKey = identifier;
        lastClickTime = now;

        meaningfulClickCount += 1;
        if (meaningfulClickCount >= 10) {
            meaningfulClickCount = 0;
            awardEngagementPoints(2, 'meaningful clicks');
        }
        lastActivityTime = now;
    };

    const markActivity = () => { lastActivityTime = Date.now(); };

    document.addEventListener('click', processClick);
    document.addEventListener('keydown', markActivity);
    document.addEventListener('mousemove', markActivity);
    document.addEventListener('scroll', markActivity);
    document.addEventListener('touchstart', markActivity);

    setInterval(() => {
        if (Date.now() - lastActivityTime <= 300000) {
            activeSeconds += 1;
            if (activeSeconds >= 300) {
                activeSeconds = 0;
                awardEngagementPoints(5, 'active 5 minutes');
            }
        } else {
            activeSeconds = 0;
        }
    }, 1000);
}

function calculateTierInfo(points) {
    // duplicate server logic for local display
    points = Number(points) || 0;
    if (points >= 1000) return { tier:'PLATINUM', nextTier:'', pointsToNext:0 };
    if (points >= 500) return { tier:'DIAMOND', nextTier:'PLATINUM', pointsToNext:1000-points };
    if (points >= 250) return { tier:'GOLD', nextTier:'DIAMOND', pointsToNext:500-points };
    if (points >= 100) return { tier:'SILVER', nextTier:'GOLD', pointsToNext:250-points };
    return { tier:'BRONZE', nextTier:'SILVER', pointsToNext:100-points };
}

function renderRewardCard() {
    const user = getCurrentUser();
    if (!user || !user.rewards) return;
    const r = user.rewards;
    const total = Number(r.points || 0);
    const tier = r.tier || calculateTierInfo(total).tier;
    const tierInfo = calculateTierInfo(total);

    const pointsEl = document.getElementById('rewards-points');
    const tierEl = document.getElementById('rewards-tier');
    const currentTierEl = document.getElementById('rewards-current-tier');
    const progressTextEl = document.getElementById('rewards-progress-text');
    const progressBarFill = document.querySelector('.progress-fill');

    if (pointsEl) pointsEl.textContent = total;
    if (tierEl) tierEl.textContent = tier;
    if (currentTierEl) currentTierEl.textContent = `${tier} Tier`;
    if (progressTextEl) progressTextEl.textContent = `${total} / ${total + tierInfo.pointsToNext} Points to ${tierInfo.nextTier || 'max'} `;
    if (progressBarFill) {
        const percent = tierInfo.pointsToNext > 0 ? (total / (total + tierInfo.pointsToNext)) * 100 : 100;
        progressBarFill.style.width = `${percent}%`;
    }
    setTierBadge(tier);
}

function syncCurrentUser() {
    return refreshCurrentUser().then(updated => {
        if (!updated) return null;
        sessionStorage.setItem('currentUser', JSON.stringify(updated));
        populateSidebar(updated);
        renderRewardCard();
        window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: updated }));
        return updated;
    }).catch(err => {
        console.warn('syncCurrentUser failed', err);
        return null;
    });
}

function initUserUI() {
    const user = getCurrentUser();
    if (!user) return;

    populateSidebar(user);

    const welcomeNameEl = document.getElementById('welcome-name');
    if (welcomeNameEl) welcomeNameEl.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

    const welcomePic = document.getElementById('welcome-picture');
    if (welcomePic) welcomePic.src = user.picture || './images/naveen.png';

    // refresh reward state and engagement tracking
    renderRewardCard();
    initRewardsTracking();

    // fetch fresh data and update cache/UI if changed
    syncCurrentUser();
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize dropdown functionality for all pages
function initDropdown() {
    
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initUserUI();
    initDropdown();
});