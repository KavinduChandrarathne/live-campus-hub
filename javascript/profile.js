
function populateProfileFields(user) {
    if (!user) return;
    const pic = user.picture && user.picture.trim() !== '' ? user.picture : './images/default.png';
    const fname = user.firstName || '';
    const lname = user.lastName || '';
    const sid = user.studentId || '';
    const email = user.email || '';
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
    const emailEl = document.getElementById('profile-email');
    if (emailEl) emailEl.value = email;
    const facultyEl = document.getElementById('profile-faculty');
    if (facultyEl) facultyEl.value = faculty;
    const dobEl = document.getElementById('profile-dob');
    if (dobEl) dobEl.value = dob;
}

document.addEventListener('DOMContentLoaded', function () {

            // Toast notification function
            function showToast(message, type = "") {
                const toast = document.getElementById('toast');
                if (!toast) return;
                toast.textContent = message;
                toast.className = 'toast show' + (type ? ' toast-' + type : '');
                setTimeout(() => {
                    toast.className = 'toast';
                }, 2600);
            }

            // Hamburger menu handler for mobile
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
        // Profile photo upload preview and update
        const photoInput = document.getElementById('profile-photo-input');
        const fileLabel = document.querySelector('.custom-file-label');
        const photoForm = document.getElementById('profile-photo-form');
        const profileImg = document.getElementById('profile-picture');
        // Custom file input label click
        if (fileLabel && photoInput) {
            fileLabel.addEventListener('click', function() {
                photoInput.click();
            });
        }
        if (photoInput && profileImg) {
            photoInput.addEventListener('change', function() {
                const file = photoInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profileImg.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        if (photoForm) {
            photoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const file = photoInput.files[0];
                if (!file) {
                    alert('Please select a photo to upload.');
                    return;
                }
                let user = null;
                const raw = sessionStorage.getItem('currentUser');
                if (raw) user = JSON.parse(raw);
                if (!user || !user.email) {
                    alert('User not found.');
                    return;
                }
                const formData = new FormData();
                formData.append('profilePhoto', file);
                formData.append('email', user.email);
                fetch('Admin/shared/php/update-profile-photo.php', {
                    method: 'POST',
                    body: formData
                })
                .then(resp => resp.json())
                .then(result => {
                    if (result.success) {
                        profileImg.src = result.picture;
                        user.picture = result.picture;
                        sessionStorage.setItem('currentUser', JSON.stringify(user));
                        alert('Profile photo updated!');
                    } else {
                        alert(result.error || 'Failed to update photo.');
                    }
                })
                .catch(() => {
                    alert('An error occurred while uploading photo.');
                });
            });
        }
    // Profile info update
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) saveBtn.addEventListener('click', function() {
        let user = null;
        const raw = sessionStorage.getItem('currentUser');
        if (raw) user = JSON.parse(raw);
        if (!user || !user.email) {
            alert('User not found.');
            return;
        }
        const fields = ['firstName', 'lastName', 'studentId', 'faculty', 'dob'];
        const payload = { email: user.email };
        fields.forEach(f => {
            const el = document.getElementById('profile-' + f);
            if (el) payload[f] = el.value;
        });
        fetch('Admin/shared/php/update-profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: Object.entries(payload).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
        })
        .then(resp => resp.json())
        .then(result => {
            if (result.success) {
                Object.assign(user, payload);
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                alert('Profile updated!');
            } else {
                alert(result.error || 'Failed to update profile.');
            }
        })
        .catch(() => {
            alert('An error occurred while updating profile.');
        });
    });

    // Password reset modal
    const passwordBtn = document.querySelector('.password-btn');
    const passwordModal = document.getElementById('password-modal');
    const passwordForm = document.getElementById('password-form');
    const closeBtn = document.querySelector('.close-btn');
    const modalCancelBtn = document.querySelector('.modal .btn.cancel');

    if (passwordBtn && passwordModal) {
        passwordBtn.addEventListener('click', function() {
            passwordModal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            passwordModal.style.display = 'none';
            passwordForm.reset();
        });
    }

    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', function() {
            passwordModal.style.display = 'none';
            passwordForm.reset();
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let user = null;
            const raw = sessionStorage.getItem('currentUser');
            if (raw) user = JSON.parse(raw);
            if (!user || !user.email) {
                alert('User not found.');
                return;
            }
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match.', 'error');
                return;
            }
            fetch('Admin/shared/php/reset-password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `email=${encodeURIComponent(user.email)}&currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`
            })
            .then(resp => resp.json())
            .then(result => {
                if (result.success) {
                    user.password = newPassword;
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    showToast('Password updated successfully!', 'success');
                    passwordModal.style.display = 'none';
                    passwordForm.reset();
                } else {
                    showToast(result.error || 'Failed to update password.', 'error');
                }
            })
            .catch(() => {
                alert('An error occurred while updating password.');
            });
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

    // Cancel button handler
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
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
