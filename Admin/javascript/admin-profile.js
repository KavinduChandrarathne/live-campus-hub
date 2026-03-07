// Click pen icon to focus input
document.querySelectorAll(".edit-icon").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = icon.parentElement.querySelector("input");
    input.removeAttribute("readonly");
    input.focus();
  });
});

// Save / Cancel / Change Password demo
document.getElementById("saveBtn").addEventListener("click", () => {
  alert("Saved changes (Demo)");
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  location.reload();
});

document.getElementById("passwordBtn").addEventListener("click", () => {
  alert("Open Change Password page (Demo)");
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