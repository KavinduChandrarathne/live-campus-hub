let currentUser = null;
let editingField = null;

document.addEventListener('DOMContentLoaded', function() {
  loadUserFromURL();
  setupEventListeners();
  setupBackButton();
});

// Load user by Student ID from URL parameter
function loadUserFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  if (!studentId) {
    alert('No user ID provided');
    window.location.href = 'user-search.html';
    return;
  }

  const token = localStorage.getItem('adminAuthToken');
  if (!token) {
    alert('Admin authentication required');
    window.location.href = 'user-search.html';
    return;
  }

  fetch(`../api/users?studentId=${encodeURIComponent(studentId)}`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
    .then(response => response.json())
    .then(result => {
      if (!result.success || !result.data) {
        throw new Error(result.error || 'User not found');
      }
      currentUser = result.data;
      displayUserDetails(result.data);
    })
    .catch(error => {
      console.error('Error loading user data:', error);
      alert('Failed to load user data. Please refresh the page.');
      window.location.href = 'user-search.html';
    });
}

// Setup back button
function setupBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = 'user-search.html';
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  const editButtons = document.querySelectorAll('.edit-icon-btn');
  editButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const field = this.dataset.field;
      enableFieldEdit(field);
    });
  });
}

// Display user details
function displayUserDetails(user) {
  document.getElementById('resultFirstName').value = user.firstName;
  document.getElementById('resultLastName').value = user.lastName;
  document.getElementById('resultStudentId').value = user.studentId;
  document.getElementById('resultFaculty').value = user.faculty;
  document.getElementById('resultDob').value = user.dob;

  const imageElement = document.querySelector('.result-photo img');
  imageElement.src = user.picture;
  imageElement.onerror = function() {
    this.src = 'images/default-user.jpg';
  };

  // Update user info
  const clubsContainer = document.getElementById('clubsContainer');
  const existingPills = clubsContainer.querySelectorAll('.info-pill');
  existingPills.forEach(pill => pill.remove());

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

  // Update rewards
  const rewardsContainer = document.getElementById('shuttlesContainer');
  const existingRewards = rewardsContainer.querySelectorAll('.info-pill');
  existingRewards.forEach(pill => pill.remove());

  if (user.rewards) {
    const pointsPill = document.createElement('div');
    pointsPill.className = 'info-pill';
    pointsPill.innerHTML = `
      <i class="fa-solid fa-star"></i>
      <span>${user.rewards.points} Points</span>
    `;
    rewardsContainer.appendChild(pointsPill);

    const tierPill = document.createElement('div');
    tierPill.className = 'info-pill';
    tierPill.innerHTML = `
      <i class="fa-solid fa-trophy"></i>
      <span>${user.rewards.tier} Tier (${user.rewards.badges} badges)</span>
    `;
    rewardsContainer.appendChild(tierPill);

    const nextTierPill = document.createElement('div');
    nextTierPill.className = 'info-pill';
    nextTierPill.innerHTML = `
      <i class="fa-solid fa-arrow-up"></i>
      <span>${user.rewards.pointsToNext} pts to ${user.rewards.nextTier}</span>
    `;
    rewardsContainer.appendChild(nextTierPill);
  }

  disableAllFieldEdits();
  document.getElementById('userDetailCard').style.display = 'block';
}

// Enable field edit
function enableFieldEdit(field) {
  if (!currentUser) {
    alert('Please load a user first');
    return;
  }

  if (editingField && editingField !== field) {
    saveFieldEdit(editingField);
  }

  let inputElement;
  let fieldContent;

  switch(field) {
    case 'firstName':
      inputElement = document.getElementById('resultFirstName');
      fieldContent = inputElement.parentElement;
      break;
    case 'lastName':
      inputElement = document.getElementById('resultLastName');
      fieldContent = inputElement.parentElement;
      break;
    case 'faculty':
      inputElement = document.getElementById('resultFaculty');
      fieldContent = inputElement.parentElement;
      break;
    case 'dob':
      inputElement = document.getElementById('resultDob');
      fieldContent = inputElement.parentElement;
      break;
    default:
      return;
  }

  editingField = field;
  inputElement.classList.remove('display-mode');
  inputElement.classList.add('edit-mode');

  if (field === 'faculty') {
    inputElement.disabled = false;
  } else {
    inputElement.removeAttribute('readonly');
  }

  const editBtn = fieldContent.querySelector('.edit-icon-btn');
  if (editBtn) {
    editBtn.style.display = 'none';
  }

  let actionsContainer = fieldContent.querySelector('.field-actions');
  if (!actionsContainer) {
    actionsContainer = document.createElement('div');
    actionsContainer.className = 'field-actions';
    fieldContent.appendChild(actionsContainer);
  } else {
    actionsContainer.innerHTML = '';
  }

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  saveBtn.title = 'Save';
  saveBtn.addEventListener('click', () => saveFieldEdit(field));

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
  cancelBtn.title = 'Cancel';
  cancelBtn.addEventListener('click', () => cancelFieldEdit(field));

  actionsContainer.appendChild(saveBtn);
  actionsContainer.appendChild(cancelBtn);

  if (field === 'faculty') {
    inputElement.focus();
    if (inputElement.showPicker && typeof inputElement.showPicker === 'function') {
      inputElement.showPicker();
    } else {
      inputElement.click();
    }
  } else {
    inputElement.focus();
    inputElement.select();
    
    inputElement.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        saveFieldEdit(field);
      } else if (e.key === 'Escape') {
        cancelFieldEdit(field);
      }
    });
  }

  if (field === 'faculty') {
    inputElement.addEventListener('change', function() {
      currentUser.faculty = inputElement.value;
    });
  }
}

// Save field edit
function saveFieldEdit(field) {
  let inputElement;
  let value;

  switch(field) {
    case 'firstName':
      inputElement = document.getElementById('resultFirstName');
      value = inputElement.value.trim();
      if (!value) {
        alert('First Name cannot be empty');
        return;
      }
      currentUser.firstName = value;
      break;
    case 'lastName':
      inputElement = document.getElementById('resultLastName');
      value = inputElement.value.trim();
      if (!value) {
        alert('Last Name cannot be empty');
        return;
      }
      currentUser.lastName = value;
      break;
    case 'faculty':
      inputElement = document.getElementById('resultFaculty');
      value = inputElement.value;
      if (!value) {
        alert('Please select a Faculty');
        return;
      }
      currentUser.faculty = value;
      break;
    case 'dob':
      inputElement = document.getElementById('resultDob');
      value = inputElement.value;
      currentUser.dob = value;
      break;
    default:
      return;
  }

  saveUserToServer(field, value);
}

// Save to server
function saveUserToServer(field, value) {
  const formData = new FormData();
  formData.append('action', 'update-user');
  formData.append('studentId', currentUser.studentId);
  formData.append('field', field);
  formData.append('value', value);

  fetch('shared/php/update-user.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      disableFieldEdit(field);
      editingField = null;
      console.log('Field saved successfully');
    } else {
      alert('Error: ' + (data.message || 'Failed to save'));
    }
  })
  .catch(error => {
    console.error('Error saving field:', error);
    alert('Error saving changes: ' + error.message);
  });
}

// Cancel field edit
function cancelFieldEdit(field) {
  let inputElement;

  switch(field) {
    case 'firstName':
      inputElement = document.getElementById('resultFirstName');
      inputElement.value = currentUser.firstName;
      break;
    case 'lastName':
      inputElement = document.getElementById('resultLastName');
      inputElement.value = currentUser.lastName;
      break;
    case 'faculty':
      inputElement = document.getElementById('resultFaculty');
      inputElement.value = currentUser.faculty;
      break;
    case 'dob':
      inputElement = document.getElementById('resultDob');
      inputElement.value = currentUser.dob;
      break;
    default:
      return;
  }

  disableFieldEdit(field);
  editingField = null;
}

// Disable field edit
function disableFieldEdit(field) {
  let inputElement;
  let fieldContent;

  switch(field) {
    case 'firstName':
      inputElement = document.getElementById('resultFirstName');
      fieldContent = inputElement.parentElement;
      break;
    case 'lastName':
      inputElement = document.getElementById('resultLastName');
      fieldContent = inputElement.parentElement;
      break;
    case 'faculty':
      inputElement = document.getElementById('resultFaculty');
      fieldContent = inputElement.parentElement;
      break;
    case 'dob':
      inputElement = document.getElementById('resultDob');
      fieldContent = inputElement.parentElement;
      break;
    default:
      return;
  }

  inputElement.classList.add('display-mode');
  inputElement.classList.remove('edit-mode');

  if (field === 'faculty') {
    inputElement.disabled = true;
  } else {
    inputElement.setAttribute('readonly', 'readonly');
  }

  const editBtn = fieldContent.querySelector('.edit-icon-btn');
  if (editBtn) {
    editBtn.style.display = '';
  }

  const actionsContainer = fieldContent.querySelector('.field-actions');
  if (actionsContainer) {
    actionsContainer.remove();
  }
}

// Disable all field edits
function disableAllFieldEdits() {
  ['firstName', 'lastName', 'faculty', 'dob'].forEach(field => {
    disableFieldEdit(field);
  });
  editingField = null;
}
