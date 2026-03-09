// Authentication helper used by all pages

// helper to get current logged-in admin user object
function getAdminUser() {
  const data = localStorage.getItem('adminUser');
  return data ? JSON.parse(data) : null;
}

// update sidebar/user widget with the logged-in user's info
function updateSidebarUser() {
  const userDiv = document.querySelector('.user');
  if (!userDiv) return;

  const user = getAdminUser();
  if (!user) return;

  const img = userDiv.querySelector('img');
  const nameP = userDiv.querySelector('p');
  const emailSmall = userDiv.querySelector('small');

  if (img) img.src = user.picture || 'images/admin.png';
  if (nameP) nameP.textContent = `${user.firstName} ${user.lastName}`;
  if (emailSmall) emailSmall.textContent = user.email;
}

function initAuth() {
  const page = window.location.pathname.split('/').pop();
  const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';

  if (page === 'index.html') {
    // if already logged in, skip the login page
    if (loggedIn) {
      window.location.href = 'admin-profile.html';
      return;
    }
  } else {
    // protect every other page
    if (!loggedIn) {
      window.location.href = 'index.html';
    }
  }

  // once we're past auth checks, populate user details in sidebar
  updateSidebarUser();
}

function attachLogoutButton() {
  const userDiv = document.querySelector('.user');
  if (!userDiv) return;

  const logoutBtn = userDiv.querySelector('#logoutBtn');
  const menu = userDiv.querySelector('.user-menu');

  function performLogout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    window.location.href = 'index.html';
  }

  // toggle dropdown when user section is clicked
  userDiv.addEventListener('click', (e) => {
    // ignore clicks inside menu to allow button activation
    if (menu && !menu.contains(e.target)) {
      menu.classList.toggle('active');
    }
  });

  // close menu when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (menu && !userDiv.contains(e.target)) {
      menu.classList.remove('active');
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      performLogout();
    });
  }
}

// run on every page load
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  attachLogoutButton();
});
