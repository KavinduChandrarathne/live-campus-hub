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

function setIconPreview(){
  iconPreview.className = `fa-solid ${iconSelect.value}`;
}
setIconPreview();
iconSelect.addEventListener("change", setIconPreview);

function getTimeLabel(){
  const now = new Date();
  let h = now.getHours();
  let m = String(now.getMinutes()).padStart(2,"0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `Today ${h}.${m} ${ampm}`;
}

updateForm.addEventListener("submit", (e)=>{
  e.preventDefault();

  const msg = document.getElementById("msgInput").value.trim();
  const desc = document.getElementById("descInput").value.trim();
  const chosenIcon = iconSelect.value;

  recentTitle.textContent = msg || "New update posted.";
  recentDesc.textContent = desc || "—";
  recentTime.textContent = getTimeLabel();
  recentIcon.className = `fa-solid ${chosenIcon}`;

  const sendNoti = document.getElementById("sendNotification").checked;
  alert(sendNoti ? "Club update posted + Notification sent! (Demo)" : "Club update posted! (Demo)");

  updateForm.reset();
  iconSelect.value = "fa-envelope";
  setIconPreview();
});

cancelBtn.addEventListener("click", ()=>{
  updateForm.reset();
  iconSelect.value = "fa-envelope";
  setIconPreview();
});

editBtn.addEventListener("click", ()=>{
  document.getElementById("msgInput").value = recentTitle.textContent;
  document.getElementById("descInput").value =
    recentDesc.textContent === "—" ? "" : recentDesc.textContent;

  alert("Loaded recent update into form (Demo).");
});

deleteBtn.addEventListener("click", ()=>{
  recentTitle.textContent = "No recent updates.";
  recentDesc.textContent = "—";
  recentTime.textContent = "";
  recentIcon.className = "fa-solid fa-envelope";
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