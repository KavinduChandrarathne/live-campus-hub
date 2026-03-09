// Load users data from JSON file
let usersData = [];

// Load users data when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadUsersData();
  setupEventListeners();
});

// Function to load users data from JSON
function loadUsersData() {
  fetch('../javascript/users.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load users data');
      }
      return response.json();
    })
    .then(data => {
      usersData = data;
      console.log('Users data loaded:', usersData);
    })
    .catch(error => {
      console.error('Error loading users data:', error);
      alert('Failed to load users data. Please refresh the page.');
    });
}

// Setup event listeners for search
function setupEventListeners() {
  const searchInput = document.getElementById('studentSearchInput');
  const searchBtn = document.getElementById('studentSearchBtn');

  // Search on button click
  searchBtn.addEventListener('click', performSearch);

  // Search on Enter key press
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

// Main search function
function performSearch() {
  const searchInput = document.getElementById('studentSearchInput').value.trim();

  if (!searchInput) {
    alert('Please enter a Student ID');
    return;
  }

  // Search for user by studentId only
  const foundUser = usersData.find(user => 
    user.studentId.toLowerCase().includes(searchInput.toLowerCase())
  );

  if (foundUser) {
    displayUserDetails(foundUser);
  } else {
    alert('User not found. Please check the Student ID.');
    clearUserDetails();
  }
}

// Display user details in the result card
function displayUserDetails(user) {
  // Update basic details
  document.getElementById('resultFirstName').textContent = user.firstName;
  document.getElementById('resultLastName').textContent = user.lastName;
  document.getElementById('resultStudentId').textContent = user.studentId;
  document.getElementById('resultFaculty').textContent = user.faculty;
  document.getElementById('resultDob').textContent = user.dob;

  // Update user image
  const imageElement = document.querySelector('.result-photo img');
  imageElement.src = user.picture;
  imageElement.onerror = function() {
    this.src = 'images/default-user.jpg'; // Fallback image
  };

  // Update clubs joined (using a placeholder message since new data doesn't have this)
  const clubsContainer = document.getElementById('clubsContainer');
  const existingClubPills = clubsContainer.querySelectorAll('.info-pill');
  existingClubPills.forEach(pill => pill.remove());

  const roleInfo = document.createElement('div');
  roleInfo.className = 'info-pill';
  roleInfo.innerHTML = `
    <i class="fa-solid fa-user-tag"></i>
    <span>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
  `;
  clubsContainer.appendChild(roleInfo);

  const emailInfo = document.createElement('div');
  emailInfo.className = 'info-pill';
  emailInfo.innerHTML = `
    <i class="fa-solid fa-envelope"></i>
    <span>${user.email}</span>
  `;
  clubsContainer.appendChild(emailInfo);

  // Update shuttles with rewards information
  const shuttlesContainer = document.getElementById('shuttlesContainer');
  const existingShuttlePills = shuttlesContainer.querySelectorAll('.info-pill');
  existingShuttlePills.forEach(pill => pill.remove());

  if (user.rewards) {
    const pointsPill = document.createElement('div');
    pointsPill.className = 'info-pill';
    pointsPill.innerHTML = `
      <i class="fa-solid fa-star"></i>
      <span>${user.rewards.points} Points</span>
    `;
    shuttlesContainer.appendChild(pointsPill);

    const tierPill = document.createElement('div');
    tierPill.className = 'info-pill';
    tierPill.innerHTML = `
      <i class="fa-solid fa-trophy"></i>
      <span>${user.rewards.tier} Tier (${user.rewards.badges} badges)</span>
    `;
    shuttlesContainer.appendChild(tierPill);

    const nextTierPill = document.createElement('div');
    nextTierPill.className = 'info-pill';
    nextTierPill.innerHTML = `
      <i class="fa-solid fa-arrow-up"></i>
      <span>${user.rewards.pointsToNext} pts to ${user.rewards.nextTier}</span>
    `;
    shuttlesContainer.appendChild(nextTierPill);
  }

  // Make result card visible
  const resultCard = document.getElementById('userResultCard');
  if (resultCard) {
    resultCard.style.display = 'block';
  }
}

// Clear user details
function clearUserDetails() {
  const resultCard = document.getElementById('userResultCard');
  if (resultCard) {
    resultCard.style.display = 'none';
  }
  document.getElementById('studentSearchInput').value = '';
}

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Clear session/localStorage if needed
      localStorage.removeItem('adminToken');
      window.location.href = 'index.html';
    });
  }
});
