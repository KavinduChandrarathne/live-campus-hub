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
  window.location.href = "campus-clubs.html";
});

// submit
clubForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("clubName").value.trim();
  const desc = document.getElementById("clubDesc").value.trim();

  if (!name) {
    alert('Club name is required');
    return;
  }

  const data = new URLSearchParams();
  data.append('name', name);
  data.append('icon', selectedIcon);
  data.append('desc', desc);

  fetch('shared/php/add-club.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data.toString()
  })
  .then(res => res.json())
  .then(result => {
    if (result.success) {
      alert('Club added successfully!');
      window.location.href = 'campus-clubs.html';
    } else {
      alert('Failed to add club: ' + (result.error || 'Unknown'));
    }
  })
  .catch(() => {
    alert('Network error creating club.');
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