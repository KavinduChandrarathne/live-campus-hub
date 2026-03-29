const searchInput = document.getElementById("searchInput");
let cards = []; // will be populated after loading
const addClubBtn = document.getElementById("addClubBtn");
const clubGrid = document.getElementById("clubGrid");

// load clubs from database API and render them
function renderClubs(clubs) {
  clubGrid.innerHTML = clubs.map(club => {
    const clubKey = club.name.toLowerCase();
    return `
      <article class="club-card" data-name="${clubKey}">
        <button class="join-btn">Join Requests</button>
        <div class="club-icon"><i class="fa-solid ${club.icon}"></i></div>
        <h3>${club.name}</h3>
        <p>${club.desc}</p>
        <a href="club-updates-admin.html?club=${encodeURIComponent(club.name)}" class="post-btn"><i class="fa-solid fa-pen-to-square"></i> Post update</a>
      </article>
    `;
  }).join('');
  cards = clubGrid.querySelectorAll('.club-card');
}

// Fetch clubs from the database API
function loadClubs() {
  fetch('shared/php/api-get-clubs.php')
    .then(res => res.json())
    .then(renderClubs)
    .catch(err => console.error('Failed to load clubs', err));
}

loadClubs();


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

clubGrid.addEventListener("click", (e) => {
  if (e.target.closest(".join-btn")) {
    window.location.href = "club-join-requests.html";
  }
});
// Join Requests button navigates to generic join request page with club name
clubGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".join-btn");
  if (btn) {
    const card = btn.closest('.club-card');
    if (card) {
      const club = card.dataset.name;
      if (club) {
        window.location.href = `club-join-requests.html?club=${encodeURIComponent(club)}`;
      }
    }
  }
});

// Demo: Post update buttons
// navigation is handled by <a> links, no JS required

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