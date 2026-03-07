// Attach click handlers to transit cards and navigate to detailed pages
document.querySelectorAll(".transit-card").forEach(card => {
  const locationName = card.dataset.location || card.querySelector('.place h3')?.textContent || 'Gampaha';

  const btnRoute = card.querySelector(".btn-route");
  const btnUpdate = card.querySelector(".btn-update");

  if (btnRoute) {
    btnRoute.addEventListener("click", () => {
      window.location.href = `bus-route.html?loc=${encodeURIComponent(locationName)}`;
    });
  }

  if (btnUpdate) {
    btnUpdate.addEventListener("click", () => {
      window.location.href = `location-updates.html?loc=${encodeURIComponent(locationName)}`;
    });
  }
});
