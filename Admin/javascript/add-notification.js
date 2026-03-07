const iconSelect = document.getElementById("iconSelect");
const iconPreview = document.getElementById("iconPreview");

function updateIconPreview(){
  iconPreview.className = `fa-solid ${iconSelect.value}`;
}
updateIconPreview();

iconSelect.addEventListener("change", updateIconPreview);

document.getElementById("notifyForm").addEventListener("submit", (e) => {
  // Let the form submit normally to PHP backend
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
