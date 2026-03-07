
function populateProfileFields(user) {
    if (!user) return;
    const pic = user.picture || './images/naveen.png';
    const fname = user.firstName || '';
    const lname = user.lastName || '';
    const sid = user.studentId || '';
    const faculty = user.faculty || '';
    const dob = user.dob || '';
    const imgEl = document.getElementById('profile-picture');
    if (imgEl) imgEl.src = pic;
    const fnameEl = document.getElementById('profile-firstname');
    if (fnameEl) fnameEl.value = fname;
    const lnameEl = document.getElementById('profile-lastname');
    if (lnameEl) lnameEl.value = lname;
    const sidEl = document.getElementById('profile-studentid');
    if (sidEl) sidEl.value = sid;
    const facultyEl = document.getElementById('profile-faculty');
    if (facultyEl) facultyEl.value = faculty;
    const dobEl = document.getElementById('profile-dob');
    if (dobEl) dobEl.value = dob;
}

document.addEventListener('DOMContentLoaded', function () {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });

        const navLinks = sidebar.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                sidebar.classList.remove('active');
            });
        });

        document.addEventListener('click', function (event) {
            if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Populate profile fields
    let user = null;
    if (typeof getCurrentUser === 'function') {
        user = getCurrentUser();
    } else if (window.getCurrentUser) {
        user = window.getCurrentUser();
    } else {
        const raw = sessionStorage.getItem('currentUser');
        if (raw) user = JSON.parse(raw);
    }
    populateProfileFields(user);

    // Button handlers
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) saveBtn.addEventListener('click', function() {
        alert('Changes Saved Successfully! (Demo)');
    });
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });
    const passwordBtn = document.querySelector('.password-btn');
    if (passwordBtn) passwordBtn.addEventListener('click', function() {
        alert('Redirect to Change Password Page (Demo)');
    });

    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', function(event) {
        if (event) event.preventDefault();
        // Remove user session so login is required again
        sessionStorage.removeItem('currentUser');
        window.location.replace('index.html'); // Redirect to login page
    });
});
