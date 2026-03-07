const iconSelect = document.getElementById("iconSelect");
const iconPreview = document.getElementById("iconPreview");

const shareLocation = document.getElementById("shareLocation");
const locationRow = document.getElementById("locationRow");
const locationInput = document.getElementById("locationInput");

const updateForm = document.getElementById("updateForm");
const cancelBtn = document.getElementById("cancelBtn");

const recentTitle = document.getElementById("recentTitle");
const recentDesc = document.getElementById("recentDesc");
const recentTime = document.getElementById("recentTime");
const recentCard = document.getElementById("recentCard");

const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");

function setIconPreview() {
  iconPreview.className = `fa-solid ${iconSelect.value}`;
}
setIconPreview();

iconSelect.addEventListener("change", setIconPreview);

// hide/show location input like screenshot (optional)
locationRow.style.display = "none";
shareLocation.addEventListener("change", () => {
  locationRow.style.display = shareLocation.checked ? "grid" : "none";
});

function getTimeLabel() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = String(now.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `Today ${hours}.${minutes} ${ampm}`;
}

updateForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = document.getElementById("msgInput").value.trim();
  const desc = document.getElementById("descInput").value.trim();
  const chosenIcon = iconSelect.value;

  // Update "Recent Updates" card
  recentTitle.textContent = msg || "New update posted.";
  recentDesc.textContent = desc || "—";
  recentTime.textContent = getTimeLabel();

  recentCard.querySelector(".recent-icon i").className = `fa-solid ${chosenIcon}`;

  // Demo notification checkbox
  const sendNoti = document.getElementById("sendNotification").checked;
  if (sendNoti) {
    alert("Update posted + Notification sent! (Demo)");
  } else {
    alert("Update posted! (Demo)");
  }

  updateForm.reset();
  setIconPreview();
  locationRow.style.display = "none";
});

cancelBtn.addEventListener("click", () => {
  updateForm.reset();
  setIconPreview();
  locationRow.style.display = "none";
});

editBtn.addEventListener("click", () => {
  // load recent values back into form (demo)
  document.getElementById("msgInput").value = recentTitle.textContent;
  document.getElementById("descInput").value =
    recentDesc.textContent === "—" ? "" : recentDesc.textContent;

  alert("Loaded recent update into form (Demo).");
});

deleteBtn.addEventListener("click", () => {
  recentTitle.textContent = "No recent updates.";
  recentDesc.textContent = "—";
  recentTime.textContent = "";
  recentCard.querySelector(".recent-icon i").className = "fa-solid fa-message";
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