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
  alert("Saved changes (Demo)");
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  location.reload();
});

document.getElementById("passwordBtn").addEventListener("click", () => {
  alert("Open Change Password page (Demo)");
});

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

