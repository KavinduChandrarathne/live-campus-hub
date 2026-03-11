// Load users data from JSON file
let usersData = [];
let searchResults = [];

// Load users data when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadUsersData();
  setupEventListeners();
});

// Function to load users data from JSON
function loadUsersData() {
  fetch('shared/json/users.json')
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

  // Search for users with partial match (case-insensitive)
  searchResults = usersData.filter(user => 
    user.studentId.toLowerCase().includes(searchInput.toLowerCase())
  );

  if (searchResults.length > 0) {
    displaySearchResults(searchResults);
  } else {
    alert('No users found. Please check the Student ID.');
    clearSearchResults();
  }
}

// Display search results as a list of clickable cards
function displaySearchResults(results) {
  const searchResultsList = document.getElementById('searchResultsList');
  const resultsContainer = document.getElementById('resultsContainer');
  
  resultsContainer.innerHTML = ''; // Clear previous results
  
  results.forEach((user, index) => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.innerHTML = `
      <img src="${user.picture}" alt="${user.firstName}" class="result-item-photo" />
      <div class="result-item-name">${user.firstName} ${user.lastName}</div>
      <div class="result-item-id">${user.studentId}</div>
    `;
    
    resultItem.addEventListener('click', () => {
      // Navigate to user edit page with student ID as parameter
      window.location.href = `user-edit.html?id=${user.studentId}`;
    });
    
    resultsContainer.appendChild(resultItem);
  });
  
  searchResultsList.style.display = 'block';
}

// Clear search results
function clearSearchResults() {
  const searchResultsList = document.getElementById('searchResultsList');
  if (searchResultsList) {
    searchResultsList.style.display = 'none';
  }
  document.getElementById('studentSearchInput').value = '';
  searchResults = [];
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
