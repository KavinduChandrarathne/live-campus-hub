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
