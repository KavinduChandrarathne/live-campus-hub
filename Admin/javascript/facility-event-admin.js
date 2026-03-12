document.addEventListener("DOMContentLoaded", function() {
    // Edit Modal Elements
    const editModal = document.getElementById("editUpdateModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const editUpdateForm = document.getElementById("editUpdateForm");
    const editIconSelect = document.getElementById("editIconSelect");
    const editIconPreview = document.getElementById("editIconPreview");
    const editMsgInput = document.getElementById("editMsgInput");
    const editDescInput = document.getElementById("editDescInput");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    let editIndex = null;

    function setEditIconPreview() {
      editIconPreview.className = `fa-solid ${editIconSelect.value}`;
    }
    editIconSelect.addEventListener("change", setEditIconPreview);

    function openEditModal(update, idx) {
      editIndex = idx;
      editIconSelect.value = update.icon;
      setEditIconPreview();
      editMsgInput.value = update.message;
      editDescInput.value = update.description || "";
      editModal.style.display = "block";
    }
    function closeEdit() {
      editModal.style.display = "none";
      editIndex = null;
      editUpdateForm.reset();
      editIconSelect.value = "fa-envelope";
      setEditIconPreview();
    }
    closeEditModal.onclick = closeEdit;
    cancelEditBtn.onclick = closeEdit;
    window.onclick = function(event) {
      if (event.target === editModal) closeEdit();
    };
    editUpdateForm.onsubmit = function(e) {
      e.preventDefault();
      if (editIndex === null) return;
      const formData = new URLSearchParams();
      formData.append("index", editIndex);
      formData.append("icon", editIconSelect.value);
      formData.append("message", editMsgInput.value);
      formData.append("description", editDescInput.value);
      fetch('shared/php/edit-facility-event-update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          closeEdit();
          fetchRecentUpdates();
        } else {
          alert("Edit failed: " + (result.error || "Unknown error"));
        }
      })
      .catch(() => {
        alert("Edit failed: Network error.");
      });
    };
  const iconSelect = document.getElementById("iconSelect");
  const iconPreview = document.getElementById("iconPreview");
  const updateForm = document.getElementById("updateForm");
  const cancelBtn = document.getElementById("cancelBtn");
  function setIconPreview(){
    iconPreview.className = `fa-solid ${iconSelect.value}`;
  }
  setIconPreview();
  iconSelect.addEventListener("change", setIconPreview);
  function formatTime(datetime) {
    const dt = new Date(datetime.replace(/-/g, '/'));
    let h = dt.getHours();
    let m = String(dt.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `Today ${h}.${m} ${ampm}`;
  }
  function renderRecentUpdates(updates) {
    const container = document.getElementById("recentUpdatesContainer");
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
        const editBtn = document.createElement("button");
        editBtn.className = "mini edit";
        editBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
        editBtn.onclick = function() {
          openEditModal(update, idx);
        };
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "mini delete";
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
        deleteBtn.onclick = function() {
          if (confirm("Are you sure you want to delete this update?")) {
            fetch('shared/php/delete-facility-event-update.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `index=${idx}`
            })
            .then(response => response.json())
            .then(result => {
              if (result.success) {
                fetchRecentUpdates();
              } else {
                alert("Delete failed: " + (result.error || "Unknown error"));
              }
            })
            .catch(() => {
              alert("Delete failed: Network error.");
            });
          }
        };
        btnsDiv.appendChild(editBtn);
        btnsDiv.appendChild(deleteBtn);
        const timeDiv = document.createElement("div");
        timeDiv.className = "recent-time";
        timeDiv.textContent = formatTime(update.datetime);
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
  function fetchRecentUpdates() {
    fetch('shared/php/get-facility-event-updates.php')
      .then(response => response.json())
      .then(updates => {
        renderRecentUpdates(updates);
      })
      .catch(() => {
        renderRecentUpdates([]);
      });
  }
  fetchRecentUpdates();
  
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
  
  updateForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const formData = new FormData(updateForm);
    
    fetch('./shared/php/add-facility-event-update.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        updateForm.reset();
        iconSelect.value = "fa-envelope";
        setIconPreview();
        fetchRecentUpdates();
        showToast('Update posted successfully', 3000);
      } else {
        showToast('Error: ' + (result.error || 'Failed to post update'), 3000);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showToast('Network error while posting update', 3000);
    });
  });
  if (cancelBtn) {
    cancelBtn.addEventListener("click", ()=>{
      updateForm.reset();
      iconSelect.value = "fa-envelope";
      setIconPreview();
    });
  }
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
});