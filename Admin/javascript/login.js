// Demo admin credentials
const DEMO_CREDENTIALS = {
  email: 'admin@campushub.com',
  password: 'admin123'
};

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

  // Forgot password
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset feature coming soon!');
  });

  // Log demo credentials for testing
  console.log('Demo = admin@campushub.com / admin123');
}

// Submit login
function submitLogin(email, password) {
  const loginBtn = document.querySelector('.login-btn');

  // Show loading
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  // Simulate network delay
  setTimeout(() => {
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      // Success
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminEmail', email);
      window.location.href = 'admin-profile.html';
    } else {
      // Failed
      alert('Invalid credentials\n\nUse: admin@campushub.com / admin123');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
      document.getElementById('password').value = '';
    }
  }, 1000);
}

// Initialize on load
// `auth.js` now handles redirecting back to the profile page if the user
// is already logged in, so we just initialise the form logic here.
document.addEventListener('DOMContentLoaded', function() {
  initLoginPage();
});

