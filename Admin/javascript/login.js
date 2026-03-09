// list of admin users loaded from JSON
let adminList = [];

// fetch the admin list file and cache it
function loadAdmins() {
  return fetch('../shared/json/admins.json')
    .then(res => res.json())
    .then(data => {
      adminList = data;
      console.log('Loaded admins:', adminList.map(u => u.email).join(', '));
    })
    .catch(err => console.error('Failed to load admin list', err));
}

// Initialize login page
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  const forgotLink = document.querySelector('.forgot-link');

  if (!loginForm) return;

  // Handle form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    // Submit login
    submitLogin(email, password);
  });

  // Forgot password (still demo)
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset feature coming soon!');
  });
}

// Submit login
function submitLogin(email, password) {
  const loginBtn = document.querySelector('.login-btn');

  // Show loading
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  // Simulate network delay
  setTimeout(() => {
    const user = adminList.find(u => u.email === email && u.password === password);
    if (user) {
      // Success
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminUser', JSON.stringify(user));
      window.location.href = 'admin-profile.html';
    } else {
      // Failed
      alert('Invalid credentials\n\nPlease check your email and password.');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
      document.getElementById('password').value = '';
    }
  }, 1000);
}

// Initialize on load
// load the admin list first, then wire up the form
document.addEventListener('DOMContentLoaded', function() {
  loadAdmins().then(initLoginPage);
});

