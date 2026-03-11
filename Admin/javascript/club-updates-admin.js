const iconSelect = document.getElementById("iconSelect");
const iconPreview = document.getElementById("iconPreview");

const updateForm = document.getElementById("updateForm");
const cancelBtn = document.getElementById("cancelBtn");

const recentIcon = document.getElementById("recentIcon");
const recentTitle = document.getElementById("recentTitle");
const recentDesc = document.getElementById("recentDesc");
const recentTime = document.getElementById("recentTime");

const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");


// Always get club name from URL
const urlParams = new URLSearchParams(window.location.search);
let clubName = urlParams.get('club') || '';
if (!clubName) {
  alert('No club specified. Please access this page from a club card.');
  window.location.href = 'campus-clubs.html';
}


function setIconPreview(){
  iconPreview.className = `fa-solid ${iconSelect.value}`;
}
// default icon for club updates
iconSelect.value = 'fa-users';
setIconPreview();
iconSelect.addEventListener("change", setIconPreview);


// Set page title and placeholders based on clubName
document.getElementById('pageTitle').textContent = `Club Updates - ${clubName}`;
document.title = `Club Updates - ${clubName}`;
const msgInput = document.getElementById('msgInput');
const descInput = document.getElementById('descInput');
if (msgInput) msgInput.placeholder = `Enter update message for ${clubName}`;
if (descInput) descInput.placeholder = `Additional details about ${clubName} (optional)`;

function getTimeLabel(datetime) {
  if (datetime) {
    const dt = new Date(datetime.replace(/-/g, '/'));
    const now = new Date();
    let h = dt.getHours();
    let m = String(dt.getMinutes()).padStart(2,"0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    if (dt.toDateString() === now.toDateString()) {
      return `Today ${h}.${m} ${ampm}`;
    }
    return `${dt.toLocaleDateString()} ${h}.${m} ${ampm}`;
  }
  const now = new Date();
  let h = now.getHours();
  let m = String(now.getMinutes()).padStart(2,"0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `Today ${h}.${m} ${ampm}`;
}

function renderRecentUpdates(updates) {
  const container = document.getElementById("recentUpdatesContainer");
  if (!container) return;
  container.innerHTML = "";
  if (updates && updates.length > 0) {
    updates.forEach((update, idx) => {
      const card = document.createElement("article");
      card.className = "recent-card";
      const iconDiv = document.createElement("div");
      iconDiv.className = "recent-icon";
      const icon = document.createElement("i");
      icon.className = `fa-solid ${update.icon}`;
      iconDiv.appendChild(icon);
      const textDiv = document.createElement("div");
      textDiv.className = "recent-text";
      const title = document.createElement("h4");
      title.textContent = update.message;
      const desc = document.createElement("p");
      desc.textContent = update.description || "—";
      textDiv.appendChild(title);
      textDiv.appendChild(desc);
      const metaDiv = document.createElement("div");
      metaDiv.className = "recent-meta";
      const btnsDiv = document.createElement("div");
      btnsDiv.className = "recent-buttons";
      const eBtn = document.createElement("button");
      eBtn.className = "mini edit";
      eBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
      eBtn.onclick = () => openEditModal(update, idx);
      const dBtn = document.createElement("button");
      dBtn.className = "mini delete";
      dBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
      dBtn.onclick = () => deleteUpdate(idx);
      btnsDiv.appendChild(eBtn);
      btnsDiv.appendChild(dBtn);
      const timeDiv = document.createElement("div");
      timeDiv.className = "recent-time";
      timeDiv.textContent = getTimeLabel(update.datetime);
      metaDiv.appendChild(btnsDiv);
      metaDiv.appendChild(timeDiv);
      card.appendChild(iconDiv);
      card.appendChild(textDiv);
      card.appendChild(metaDiv);
      container.appendChild(card);
    });
  } else {
    container.innerHTML = "<p>No recent updates.</p>";
  }
}

let editIndex = null;
function openEditModal(update, idx) {
  editIndex = idx;
  iconSelect.value = update.icon;
  setIconPreview();
  document.getElementById("msgInput").value = update.message;
  document.getElementById("descInput").value = update.description || "";
}

function closeEdit() {
  editIndex = null;
  updateForm.reset();
  iconSelect.value = "fa-users";
  setIconPreview();
}

function fetchRecentUpdates() {
  if (!clubName) return;
  console.log('fetchRecentUpdates for', clubName);
  fetch(`shared/php/get-club-updates.php?club=${encodeURIComponent(clubName)}`)
    .then(r => {
      console.log('response status', r.status);
      return r.json();
    })
    .then(upd => {
      console.log('updates received', upd);
      renderRecentUpdates(upd);
    })
    .catch(e => {
      console.error('error loading club updates', e);
      renderRecentUpdates([]);
    });
}

updateForm.addEventListener("submit", function(e) {
  e.preventDefault();
  if (!clubName) {
    alert('Club name missing');
    return;
  }
  const msg = document.getElementById("msgInput").value.trim();
  const desc = document.getElementById("descInput").value.trim();
  const icon = iconSelect.value;

  const data = new URLSearchParams();
  data.append('clubName', clubName);
  data.append('icon', icon);
  data.append('message', msg);
  data.append('description', desc);

  let url = 'shared/php/add-club-update.php';
  if (editIndex !== null) {
    data.append('index', editIndex);
    url = 'shared/php/edit-club-update.php';
  }

  console.log('posting update to', url, 'payload', data.toString());
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data.toString()
  })
  .then(r => r.json())
  .then(result => {
    console.log('post result', result);
    if (result.success) {
      closeEdit();
      fetchRecentUpdates();
    } else {
      alert('Failed: ' + (result.error||'Unknown'));
    }
  })
  .catch(e => {
    console.error('network error during post', e);
    alert('Network error');
  });
});

cancelBtn.addEventListener("click", () => {
  closeEdit();
});

function deleteUpdate(idx) {
  if (!confirm('Are you sure you want to delete this update?')) return;
  const data = new URLSearchParams();
  data.append('clubName', clubName);
  data.append('index', idx);
  fetch('shared/php/delete-club-update.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data.toString()
  })
  .then(r=>r.json())
  .then(res=>{
    if (res.success) fetchRecentUpdates();
    else alert('Delete failed: '+(res.error||'Unknown'));
  })
  .catch(()=>alert('Network error'));
}

// sidebar and other UI identical to before
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


// initial load
fetchRecentUpdates();