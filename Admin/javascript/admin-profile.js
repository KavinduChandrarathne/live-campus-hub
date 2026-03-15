// populate profile details from logged-in admin
function populateProfile() {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  console.log('populateProfile user:', user);
  if (!user || !user.email) return;

  // sidebar info
  const sidebarImg = document.querySelector('.sidebar .user img');
  const sidebarName = document.querySelector('.sidebar .user p');
  const sidebarEmail = document.querySelector('.sidebar .user small');
  if (sidebarImg) sidebarImg.src = 'images/admin.png';
  if (sidebarName) sidebarName.textContent = `${user.firstName || ''} ${user.lastName || ''}`;
  if (sidebarEmail) sidebarEmail.textContent = user.email || '';

  // profile card image
  const profileImg = document.querySelector('.profile-left img');
  if (profileImg) profileImg.src = 'images/admin.png';

  // fields
  const fields = ['firstName', 'lastName', 'studentId', 'dob'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = user[id] || '';
  });
}

// Click pen icon to focus input
document.querySelectorAll(".edit-icon").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = icon.parentElement.querySelector("input");
    input.removeAttribute("readonly");
    input.focus();
  });
});

// Save / Cancel / Change Password demo

document.getElementById("saveBtn").addEventListener("click", () => {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  if (!user || !user.email) {
    alert('Admin not found.');
    return;
  }
  const fields = ['firstName', 'lastName', 'studentId', 'dob'];
  const payload = { email: user.email, role: 'admin' };
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) payload[f] = el.value;
  });
  fetch('shared/php/update-profile.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Object.entries(payload).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
  })
  .then(resp => resp.json())
  .then(result => {
    if (result.success) {
      Object.assign(user, payload);
      localStorage.setItem('adminUser', JSON.stringify(user));
      alert('Profile updated!');
    } else {
      alert(result.error || 'Failed to update profile.');
    }
  })
  .catch(() => {
    alert('An error occurred while updating profile.');
  });
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  location.reload();
});

document.getElementById("passwordBtn").addEventListener("click", () => {
  const passwordModal = document.getElementById('password-modal');
  if (passwordModal) passwordModal.style.display = 'block';
});

// Modal handlers
const passwordModal = document.getElementById('password-modal');
const passwordForm = document.getElementById('password-form');
const closeBtn = document.querySelector('.close-btn');
const modalCancelBtn = document.querySelector('.modal .btn.cancel');

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
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (!user || !user.email) {
      alert('Admin not found.');
      return;
    }
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    fetch('shared/php/reset-password.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(user.email)}&currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}&role=admin`
    })
    .then(resp => resp.json())
    .then(result => {
      if (result.success) {
        user.password = newPassword;
        localStorage.setItem('adminUser', JSON.stringify(user));
        alert('Password updated!');
        passwordModal.style.display = 'none';
        passwordForm.reset();
      } else {
        alert(result.error || 'Failed to update password.');
      }
    })
    .catch(() => {
      alert('An error occurred while updating password.');
    });
  });
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

// script is placed at the end of <body>, so DOM is already ready
populateProfile();

const headerLogout = document.getElementById('headerLogoutBtn');
if (headerLogout) {
  headerLogout.addEventListener('click', (e) => {
    e.preventDefault();
    // perform logout directly
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    window.location.href = 'index.html';
  });
}

