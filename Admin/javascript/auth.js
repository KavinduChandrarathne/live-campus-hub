// Authentication helper used by all pages

function initAuth() {
  const page = window.location.pathname.split('/').pop();
  const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';

  if (page === 'login.html') {
    // if already logged in, skip the login page
    if (loggedIn) {
      window.location.href = 'admin-profile.html';
    }
  } else {
    // protect every other page
    if (!loggedIn) {
      window.location.href = 'login.html';
    }
  }
}

function attachLogoutButton() {
  const userDiv = document.querySelector('.user');
  if (!userDiv) return;

  const logoutBtn = userDiv.querySelector('#logoutBtn');
  const menu = userDiv.querySelector('.user-menu');

  function performLogout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    window.location.href = 'login.html';
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
