const routeSelect = document.getElementById("routeSelect");
const iconPreview = document.getElementById("iconPreview");

const sendLiveLocation = document.getElementById("sendLiveLocation");
const liveLinkRow = document.getElementById("liveLinkRow");
const liveLinkInput = document.getElementById("liveLinkInput");

const updateForm = document.getElementById("updateForm");
const cancelBtn = document.getElementById("cancelBtn");

const recentList = document.getElementById("recentList");
const tilesContainer = document.getElementById("routeTiles");

const routes = ['Gampaha','Negombo','Moratuwa','Wattala'];

let editIndex = null; // if non-null we are editing an existing update

function showToast(message, duration = 3000) {
  const toast = document.getElementById('successToast');
  const toastMessage = document.getElementById('toastMessage');
  if (!toast) return;
  toastMessage.textContent = message;
  toast.classList.remove('hide');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.classList.remove('show', 'hide');
    }, 400);
  }, duration);
}

function iconForRoute(r) {
  switch(r) {
    case 'Gampaha': return 'fa-bus';
    case 'Negombo': return 'fa-umbrella-beach';
    case 'Wattala': return 'fa-city';
    case 'Moratuwa': return 'fa-monument';
    default: return 'fa-bus';
  }
}

function setIconPreview() {
  const opt = routeSelect.options[routeSelect.selectedIndex];
  const icon = opt.dataset.icon || 'fa-bus';
  iconPreview.className = `fa-solid ${icon}`;
}
setIconPreview();
routeSelect.addEventListener("change", () => {
  setIconPreview();
  fetchUpdates();
  updateTiles();
});

// hide/show live link input
liveLinkRow.style.display = "none";
sendLiveLocation.addEventListener("change", () => {
  liveLinkRow.style.display = sendLiveLocation.checked ? "grid" : "none";
});

function getTimeLabel() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = String(now.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `Today ${hours}.${minutes} ${ampm}`;
}

function renderRecent(updates) {
  recentList.innerHTML = '';
  if (!updates || updates.length === 0) {
    recentList.innerHTML = '<div class="no-updates" style="padding:12px;color:#55687f;">No updates yet.</div>';
    return;
  }

  updates.forEach((u, idx) => {
    const card = document.createElement('article');
    card.className = 'recent-card';

    // icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'recent-icon';
    iconDiv.innerHTML = `<i class="fa-solid ${u.icon || 'fa-bus'}"></i>`;

    // text
    const textDiv = document.createElement('div');
    textDiv.className = 'recent-text';
    const title = document.createElement('h4');
    title.textContent = u.message;
    const desc = document.createElement('p');
    desc.textContent = u.description || '';
    textDiv.appendChild(title);
    textDiv.appendChild(desc);

    // meta (time + optional live link)
    const metaDiv = document.createElement('div');
    metaDiv.className = 'recent-meta';

    const timeDiv = document.createElement('div');
    timeDiv.className = 'recent-time';
    timeDiv.textContent = u.datetime;
    metaDiv.appendChild(timeDiv);

    if (u.liveLink) {
      const link = document.createElement('a');
      link.href = u.liveLink;
      link.target = '_blank';
      link.textContent = 'Live Location';
      link.style.fontSize = '11px';
      link.style.color = '#3f6fd6';
      metaDiv.appendChild(link);
    }

    // action buttons (edit/delete)
    const btnsDiv = document.createElement('div');
    btnsDiv.className = 'recent-buttons';
    const eBtn = document.createElement('button');
    eBtn.className = 'mini edit';
    eBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    eBtn.title = 'Edit';
    eBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEdit(u, idx);
    });
    const dBtn = document.createElement('button');
    dBtn.className = 'mini delete';
    dBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    dBtn.title = 'Delete';
    dBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteUpdate(idx);
    });
    btnsDiv.appendChild(eBtn);
    btnsDiv.appendChild(dBtn);
    metaDiv.appendChild(btnsDiv);

    card.appendChild(iconDiv);
    card.appendChild(textDiv);
    card.appendChild(metaDiv);
    recentList.appendChild(card);
  });
}

function fetchUpdates() {
  const route = routeSelect.value;
  fetch(`shared/php/get-transit-updates.php?route=${encodeURIComponent(route)}`)
    .then(r => r.json())
    .then(arr => {
      renderRecent(arr);
    })
    .catch(err => console.error('failed to load updates', err));
}


function fetchAllJoinRequests() {
  return fetch('shared/php/get-transit-join-requests.php')
    .then(r => r.json())
    .catch(err => {
      console.error('failed to load join requests', err);
      return [];
    });
}

function renderRequestTiles(allRequests) {
  if (!tilesContainer) return;
  tilesContainer.innerHTML = '';
  const counts = {};
  allRequests.forEach(r => {
    if (r.status === 'pending') {
      counts[r.route] = (counts[r.route]||0) + 1;
    }
  });
  routes.forEach(route => {
    const tile = document.createElement('div');
    tile.className = 'route-tile';
    tile.dataset.route = route;
    tile.innerHTML = `<i class="fa-solid ${iconForRoute(route)}"></i><span>${route}</span><span class="tile-count">${counts[route]||0} pending</span><button class="btn view-btn" data-route="${route}">View requests</button>`;
    tilesContainer.appendChild(tile);

    // clicking the button navigates to dedicated join‑request page
    tile.querySelector('.view-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `transit-requests.html?route=${encodeURIComponent(route)}`;
    });
  });
}

function selectRouteTile(route) {
  // update select control and refresh update tiles
  routeSelect.value = route;
  setIconPreview();
  fetchUpdates();
  updateTiles();
  // highlight tile
  document.querySelectorAll('.route-tile').forEach(t => {
    t.classList.toggle('selected', t.dataset.route === route);
  });
}

function updateTiles() {
  fetchAllJoinRequests().then(arr => {
    renderRequestTiles(arr);
  });
}

// join actions moved to dedicated page
updateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const postBtn = updateForm.querySelector('.btn.post');
  postBtn.disabled = true;

  const route = routeSelect.value;
  const chosenIcon = routeSelect.options[routeSelect.selectedIndex].dataset.icon;
  const msg = document.getElementById("msgInput").value.trim();
  const desc = document.getElementById("descInput").value.trim();
  const liveLink = sendLiveLocation.checked ? liveLinkInput.value.trim() : '';
  const sendNoti = document.getElementById("sendNotification").checked;

  const formData = new FormData();
  formData.append('route', route);
  formData.append('icon', chosenIcon);
  formData.append('message', msg);
  formData.append('description', desc);
  if (liveLink) formData.append('liveLink', liveLink);
  if (sendNoti) formData.append('sendNotification', 'on');
  let url = 'shared/php/add-transit-update.php';
  if (editIndex !== null) {
    formData.append('index', editIndex);
    url = 'shared/php/edit-transit-update.php';
  }

  fetch(url, {
    method: 'POST',
    body: formData
  })
    .then(r => r.json())
    .then(resp => {
      if (resp.success) {
        showToast(editIndex !== null ? 'Update saved' : 'Update posted' + (sendNoti ? ' Notification sent.' : ''));
        updateForm.reset();
        setIconPreview();
        liveLinkRow.style.display = "none";
        if (editIndex !== null) {
          editIndex = null;
          postBtn.textContent = 'Post Update';
        }
        fetchUpdates();
        updateTiles();
      } else {
        showToast('Error: ' + (resp.error || 'unknown'));
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Request failed');
    })
    .finally(() => {
      postBtn.disabled = false;
    });
});

cancelBtn.addEventListener("click", () => {
  cancelEdit();
});

function cancelEdit() {
  editIndex = null;
  updateForm.reset();
  routeSelect.disabled = false;
  setIconPreview();
  liveLinkRow.style.display = "none";
  const postBtn = updateForm.querySelector('.btn.post');
  if (postBtn) postBtn.textContent = 'Post Update';
  // refresh updates in case something changed while editing
  fetchUpdates();
}

function openEdit(u, idx) {
  editIndex = idx;
  routeSelect.value = u.route;
  routeSelect.disabled = true; // prevent changing the route while editing
  setIconPreview();
  document.getElementById('msgInput').value = u.message;
  document.getElementById('descInput').value = u.description || '';
  if (u.liveLink) {
    sendLiveLocation.checked = true;
    liveLinkRow.style.display = 'grid';
    liveLinkInput.value = u.liveLink;
  } else {
    sendLiveLocation.checked = false;
    liveLinkRow.style.display = 'none';
  }
  const postBtn = updateForm.querySelector('.btn.post');
  postBtn.textContent = 'Save Changes';
}

function deleteUpdate(idx) {
  if (!confirm('Are you sure you want to delete this update?')) return;
  const route = routeSelect.value;
  const data = new URLSearchParams();
  data.append('route', route);
  data.append('index', idx);
  fetch('shared/php/delete-transit-update.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data.toString()
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        showToast('Update deleted');
        fetchUpdates();
        updateTiles();
      } else {
        showToast('Delete failed: ' + (res.error || 'Unknown'));
      }
    })
    .catch(() => showToast('Network error'));
}

// initial data
fetchUpdates();
updateTiles();

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
