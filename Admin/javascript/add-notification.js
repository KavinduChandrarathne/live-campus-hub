const iconSelect = document.getElementById("iconSelect");
const iconPreview = document.getElementById("iconPreview");
const notifyForm = document.getElementById("notifyForm");

function updateIconPreview(){
  iconPreview.className = `fa-solid ${iconSelect.value}`;
}
updateIconPreview();

iconSelect.addEventListener("change", updateIconPreview);

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

notifyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const title = document.getElementById("titleInput").value.trim();
  const message = document.getElementById("msgInput").value.trim();
  const icon = iconSelect.value;
  
  if (!title || !message) {
    showToast('Please fill in all required fields', 3000);
    return;
  }
  
  const formData = new FormData();
  formData.append('title', title);
  formData.append('message', message);
  formData.append('icon', icon);
  formData.append('type', 'direct');
  
  fetch('./shared/php/add-notification.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      notifyForm.reset();
      iconSelect.value = 'fa-bell';
      updateIconPreview();
      showToast('Notification sent successfully', 3000);
    } else {
      showToast('Error: ' + (result.error || 'Failed to send notification'), 3000);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('Network error while sending notification', 3000);
  });
});

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
