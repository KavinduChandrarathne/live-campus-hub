const requestTabs = document.querySelectorAll(".request-tab");
const requestCards = document.querySelectorAll(".request-card");
const pendingCountEl = document.getElementById("pendingCount");
const acceptedCountEl = document.getElementById("acceptedCount");
const rejectedCountEl = document.getElementById("rejectedCount");

function updateRequestCounts() {
  let pending = 0;
  let accepted = 0;
  let rejected = 0;

  requestCards.forEach(card => {
    const status = card.dataset.status;

    if (status === "pending") pending++;
    if (status === "accepted") accepted++;
    if (status === "rejected") rejected++;
  });

  if (pendingCountEl) pendingCountEl.textContent = pending;
  if (acceptedCountEl) acceptedCountEl.textContent = accepted;
  if (rejectedCountEl) rejectedCountEl.textContent = rejected;
}

function filterRequests(filter) {
  requestCards.forEach(card => {
    if (filter === "all" || card.dataset.status === filter) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });
}

if (requestTabs.length) {
  requestTabs.forEach(tab => {
    tab.addEventListener("click", function () {
      requestTabs.forEach(item => item.classList.remove("active"));
      this.classList.add("active");
      filterRequests(this.dataset.filter);
    });
  });
}

requestCards.forEach(card => {
  const acceptBtn = card.querySelector(".accept-btn");
  const rejectBtn = card.querySelector(".reject-btn");

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      card.dataset.status = "accepted";
      card.classList.add("accepted-card");
      card.classList.remove("rejected-card");

      updateRequestCounts();

      const activeTab = document.querySelector(".request-tab.active");
      if (activeTab) {
        filterRequests(activeTab.dataset.filter);
      }
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", function () {
      card.dataset.status = "rejected";
      card.classList.add("rejected-card");
      card.classList.remove("accepted-card");

      updateRequestCounts();

      const activeTab = document.querySelector(".request-tab.active");
      if (activeTab) {
        filterRequests(activeTab.dataset.filter);
      }
    });
  }
});

if (requestCards.length) {
  updateRequestCounts();
  filterRequests("pending");
}