// Admin login now uses the centralized API with JWT authentication

function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  const forgotLink = document.querySelector('.forgot-link');

  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    submitLogin(email, password);
  });

  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password reset feature coming soon!');
    });
  }
}

function submitLogin(email, password) {
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
  }

  fetch('../api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(result => {
      if (result.success && result.user && result.token) {
        localStorage.setItem('adminAuthToken', result.token);
        localStorage.setItem('adminUser', JSON.stringify(result.user));
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminEmail', result.user.email || '');
        window.location.href = 'admin-profile.html';
        return;
      }
      alert(result.error || 'Invalid credentials. Please check your email and password.');
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
      document.getElementById('password').value = '';
    })
    .catch(err => {
      console.error('Admin login failed', err);
      alert('An error occurred. Please try again later.');
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    });
}

document.addEventListener('DOMContentLoaded', initLoginPage);

