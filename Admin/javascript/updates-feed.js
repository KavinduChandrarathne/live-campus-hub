// Demo edit/delete actions
document.querySelectorAll(".feed-card").forEach(card => {

  const editBtn = card.querySelector(".mini.edit");
  const deleteBtn = card.querySelector(".mini.delete");

  editBtn.addEventListener("click", () => {
    alert("Edit clicked (Demo)");
  });

  deleteBtn.addEventListener("click", () => {
    card.remove();
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