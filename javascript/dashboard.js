// Mobile hamburger menu toggle
document.addEventListener('DOMContentLoaded', function () {

        // ...dropdown logic removed...

        // Logout button logic
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                sessionStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking on a link
        const navLinks = sidebar.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                sidebar.classList.remove('active');
            });
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', function (event) {
            if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

        // Populate user info in sidebar and welcome
        if (typeof initUserUI === 'function') {
            initUserUI();
        } else if (window.initUserUI) {
            window.initUserUI();
        } else {
            // fallback if common.js not loaded
            const raw = sessionStorage.getItem('currentUser');
            if (!raw) {
                window.location.href = 'index.html';
                return;
            }
            const user = JSON.parse(raw);
            const pic = user.picture || './images/naveen.png';
            const name = `${user.firstName} ${user.lastName}`;
            document.getElementById('sidebar-picture').src = pic;
            document.getElementById('sidebar-name').textContent = name;
            document.getElementById('sidebar-email').textContent = user.email;
            const welcomeName = document.getElementById('welcome-name');
            if (welcomeName) welcomeName.textContent = name;
            const welcomePic = document.getElementById('welcome-picture');
            if (welcomePic) welcomePic.src = pic;
        }

    // Notification Popup
    const notifyBtn = document.getElementById('notifyBtn');
    const notificationPopup = document.getElementById('notificationPopup');
    const closeNotifyBtn = document.getElementById('closeNotifyBtn');
    const notificationList = document.getElementById('notificationList');
    const notifyCount = document.getElementById('notifyCount');

    if (notifyBtn && notificationPopup) {
        // Open notification popup
        notifyBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isShowing = notificationPopup.classList.contains('show');
            if (isShowing) {
                notificationPopup.classList.remove('show');
            } else {
                loadNotifications();
                notificationPopup.classList.add('show');
            }
        });

        // Close notification popup
        if (closeNotifyBtn) {
            closeNotifyBtn.addEventListener('click', function () {
                notificationPopup.classList.remove('show');
            });
        }

        // Close popup when clicking outside
        document.addEventListener('click', function (event) {
            if (!notificationPopup.contains(event.target) && !notifyBtn.contains(event.target)) {
                notificationPopup.classList.remove('show');
            }
        });

        // Close popup when pressing Escape
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                notificationPopup.classList.remove('show');
            }
        });
    }

    // Load and display notifications
    function loadNotifications() {
        const raw = sessionStorage.getItem('currentUser');
        const studentId = raw ? JSON.parse(raw).studentId : '';
        const params = new URLSearchParams({ studentId: studentId });
        
        fetch('Admin/shared/php/get-notifications.php?' + params.toString())
            .then(response => response.json())
            .then(notifications => {
                displayNotifications(notifications);
            })
            .catch(error => {
                console.error('Error loading notifications:', error);
                notificationList.innerHTML = '<div class="notification-empty">Failed to load notifications</div>';
            });
    }

    function formatNotificationTime(datetime) {
        const now = new Date();
        const notifTime = new Date(datetime.replace(/-/g, '/'));
        const diff = Math.floor((now - notifTime) / 1000); // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
        
        return notifTime.toLocaleDateString();
    }

    function displayNotifications(notifications) {
        if (!notificationList) return;

        if (!notifications || notifications.length === 0) {
            notificationList.innerHTML = '<div class="notification-empty">No notifications</div>';
            if (notifyCount) notifyCount.textContent = '0';
            return;
        }

        notificationList.innerHTML = '';
        notifications.forEach((notif) => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.setAttribute('data-notif-id', notif.id || '');

            const type = notif.type || 'direct';
            let iconClass = 'fa-bell';
            let iconBg = 'direct';

            if (type === 'facility') {
                iconClass = 'fa-bullhorn';
                iconBg = 'facility';
            } else if (type === 'club') {
                iconClass = 'fa-users';
                iconBg = 'club';
            }

            const icon = document.createElement('div');
            icon.className = `notification-icon ${iconBg}`;
            icon.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

            const content = document.createElement('div');
            content.className = 'notification-content';

            const title = document.createElement('p');
            title.className = 'notification-title';
            title.textContent = notif.title;

            const message = document.createElement('p');
            message.className = 'notification-message';
            message.textContent = notif.message;

            const time = document.createElement('p');
            time.className = 'notification-time';
            time.textContent = formatNotificationTime(notif.datetime);

            content.appendChild(title);
            content.appendChild(message);
            content.appendChild(time);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'notification-delete-btn';
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.title = 'Delete notification';
            deleteBtn.onclick = function(e) {
                e.stopPropagation();
                deleteNotification(notif.id);
            };

            // Add click handler to navigate to update (only for club and facility types)
            if (type !== 'direct') {
                item.addEventListener('click', function(e) {
                    if (!e.target.closest('.notification-delete-btn')) {
                        navigateToUpdate(notif);
                    }
                });
                item.style.cursor = 'pointer';
            }

            item.appendChild(icon);
            item.appendChild(content);
            item.appendChild(deleteBtn);
            notificationList.appendChild(item);
        });

        if (notifyCount) {
            notifyCount.textContent = Math.min(notifications.length, 9) === 9 && notifications.length > 9 ? '9+' : notifications.length;
        }
    }

    function deleteNotification(notifId) {
        if (!confirm('Delete this notification?')) return;

        const formData = new URLSearchParams();
        formData.append('id', notifId);

        fetch('Admin/shared/php/delete-notification.php', {
            method: 'POST',
            body: formData.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadNotifications();
            } else {
                alert('Failed to delete notification');
            }
        })
        .catch(error => {
            console.error('Error deleting notification:', error);
            alert('Error deleting notification');
        });
    }

    // Navigate to the update page and highlight the specific update
    function navigateToUpdate(notif) {
        // Store the notification info in sessionStorage for the destination page
        sessionStorage.setItem('highlightUpdate', JSON.stringify({
            type: notif.type,
            datetime: notif.datetime,
            message: notif.message,
            clubName: notif.clubName,
            facility: notif.facility
        }));

        // Navigate to appropriate page
        if (notif.type === 'club') {
            // Extract the club name and navigate to club detail page
            const clubName = notif.clubName || 'Coding Club';
            const clubParam = clubName.trim().toLowerCase().split(' ')[0];
            window.location.href = `club-detail.html?club=${clubParam}`;
        } else if (notif.type === 'facility') {
            window.location.href = 'facility.html';
        }
    }

    // Load notifications on page load
    loadNotifications();
    // Refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);

    // Scroll-to-top button (mobile): show when scrolled down and smooth-scroll to top
    var btn = document.getElementById('scrollTop');
    if (!btn) return;

    function onScroll() {
        if (window.scrollY > 300) btn.classList.add('show');
        else btn.classList.remove('show');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
