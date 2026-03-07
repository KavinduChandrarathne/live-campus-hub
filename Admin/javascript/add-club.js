const logoCards = document.querySelectorAll(".logo-card");
const cancelBtn = document.getElementById("cancelBtn");
const clubForm = document.getElementById("clubForm");

let selectedIcon = "fa-user-group";
let selectedClubName = "Coding Club";

// select logo
logoCards.forEach(card => {
  card.addEventListener("click", () => {
    logoCards.forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    selectedIcon = card.dataset.icon;
    selectedClubName = card.dataset.name;
  });
});

cancelBtn.addEventListener("click", () => {
  clubForm.reset();
  alert("Cancelled (Demo)");
});

// submit
clubForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("clubName").value.trim();
  const desc = document.getElementById("clubDesc").value.trim();
  const sendNoti = document.getElementById("sendNoti").checked;

  alert(
    `Club Created! (Demo)\n\nClub Name: ${name}\nDescription: ${desc || "-"}\nLogo: ${selectedClubName}\nSend notification: ${sendNoti}`
  );

  clubForm.reset();
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