const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".club-card");
const addClubBtn = document.getElementById("addClubBtn");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();

  cards.forEach(card => {
    const name = card.dataset.name;
    card.style.display = name.includes(q) ? "block" : "none";
  });
});

// Add club button navigates to add-club.html
addClubBtn.addEventListener("click", () => {
  // replace alert with real navigation
  window.location.href = "add-club.html";
});

// Demo: Post update buttons
document.querySelectorAll(".post-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    alert("Post update clicked (Demo) - open Club Updates page here.");
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