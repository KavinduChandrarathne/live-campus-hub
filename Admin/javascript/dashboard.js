// Navigation: click card -> go to page
const pageMap = {
  facility: 'facility-event-admin.html',
  transit: 'transit.html',
  clubs: 'campus-clubs.html',
  updates: 'updates-feed.html',
  notifications: 'add-notification.html',
  calendar: 'calendar.html',
  emergency: 'emergency-alerts.html'
};

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const key = card.dataset.page;
    const target = pageMap[key] || '#';
    if (target && target !== '#') {
      window.location.href = target;
    } else {
      alert(`Page for ${key} not available yet (Demo)`);
    }
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