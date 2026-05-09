let searchResults = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
});

// Setup event listeners for search
function setupEventListeners() {
  const searchInput = document.getElementById('studentSearchInput');
  const searchBtn = document.getElementById('studentSearchBtn');

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
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

  const token = localStorage.getItem('adminAuthToken');
  if (!token) {
    alert('Admin authentication required');
    return;
  }

  fetch(`/api/users?search=${encodeURIComponent(searchInput)}`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
    .then(response => response.json())
    .then(result => {
      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }
      searchResults = result.data || [];

      if (searchResults.length > 0) {
        displaySearchResults(searchResults);
      } else {
        alert('No users found. Please check the Student ID.');
        clearSearchResults();
      }
    })
    .catch(error => {
      console.error('Error loading users data:', error);
      alert('Failed to load users data. Please refresh the page.');
    });
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
      localStorage.removeItem('adminAuthToken');
      localStorage.removeItem('adminUser');
      window.location.href = 'index.html';
    });
  }
});
