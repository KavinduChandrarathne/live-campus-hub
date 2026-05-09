// Render only requests for a specific club
function renderClubRequests(clubName) {
  fetch('shared/php/get-join-requests.php?t=' + Date.now())
    .then(res => res.json())
    .then(requests => {
      // keep global copy with original indexes
      allRequests = requests;
      const normalized = clubName.trim().toLowerCase();
      // wrap each request with its original index
      const wrapped = requests
        .map((r, i) => ({ r, i }))
      .filter(({ r }) => {
        const existing = (r.clubName || '').trim().toLowerCase();
        return existing === normalized;
      })
      .reduce((acc, cur) => {
        // Keep only one request per student per club (latest + accepted priority)
        const studentId = (cur.r.studentId || '').trim().toLowerCase();
        const key = `${studentId}::${normalized}`;
        const existing = acc.find(item => item.key === key);
        if (!existing) {
          acc.push({ key, item: cur });
          return acc;
        }
        const statusPriority = status => {
          if (!status) return 1;
          const s = status.toLowerCase();
          if (s === 'accepted') return 4;
          if (s === 'pending') return 3;
          if (s === 'rejected') return 2;
          return 1;
        };
        const newScore = statusPriority(cur.r.status);
        const oldScore = statusPriority(existing.item.r.status);
        if (newScore > oldScore || (newScore === oldScore && cur.i > existing.item.i)) {
          existing.item = cur;
        }
        return acc;
      }, [])
      .map(entry => entry.item);

      renderRequests(wrapped);
    })
    .catch(err => {
      console.error('Failed to load join requests', err);
      renderRequests([]);
    });
}
const requestTabs = document.querySelectorAll(".request-tab");
const requestList = document.getElementById("requestList");
const pendingCountEl = document.getElementById("pendingCount");
const acceptedCountEl = document.getElementById("acceptedCount");
const rejectedCountEl = document.getElementById("rejectedCount");
let requestCards = [];
let allRequests = [];
const removedCountEl = document.getElementById("removedCount");

function updateRequestCounts() {
  let pending = 0;
  let accepted = 0;
  let rejected = 0;
  let removed = 0;

  requestCards.forEach(card => {
    const status = card.dataset.status;
    if (status === "pending") pending++;
    if (status === "accepted") accepted++;
    if (status === "rejected") rejected++;
    if (status === "removed") removed++;
  });

  if (pendingCountEl) pendingCountEl.textContent = pending;
  if (acceptedCountEl) acceptedCountEl.textContent = accepted;
  if (rejectedCountEl) rejectedCountEl.textContent = rejected;
  if (removedCountEl) removedCountEl.textContent = removed;
}

function filterRequests(filter) {
  requestCards.forEach(card => {
    const cardStatus = card.dataset.status;
    let shouldShow = false;
    
    if (filter === "all") {
      // In "all" view, show all except rejected and removed
      shouldShow = cardStatus !== "rejected" && cardStatus !== "removed";
    } else if (filter === "pending") {
      shouldShow = cardStatus === "pending";
    } else if (filter === "accepted") {
      shouldShow = cardStatus === "accepted";
    } else if (filter === "rejected") {
      shouldShow = cardStatus === "rejected";
    } else if (filter === "removed") {
      shouldShow = cardStatus === "removed";
    }
    
    if (shouldShow) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });
}

function changeStatus(card, newStatus) {
  const studentId = card.dataset.studentId;
  const clubName = card.dataset.clubName;
  
  if (!studentId || !clubName) {
    console.error('Missing studentId or clubName:', { studentId, clubName });
    return;
  }
  
  fetch('shared/php/update-join-request.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `studentId=${encodeURIComponent(studentId)}&clubName=${encodeURIComponent(clubName)}&status=${newStatus}`
  }).then(res => res.json()).then(res => {
    if (!res.success) console.error('Failed to persist status', res.error);
  }).catch(err => console.error('Network error', err));
}

function attachGlobalHandlers() {
  // tab filtering
  if (requestTabs.length) {
    requestTabs.forEach(tab => {
      tab.addEventListener("click", function () {
        requestTabs.forEach(item => item.classList.remove("active"));
        this.classList.add("active");
        filterRequests(this.dataset.filter);
      });
    });
  }

  // accept/reject delegation
  if (requestList) {
    requestList.addEventListener('click', e => {
      const card = e.target.closest('.request-card');
      if (!card) return;
      if (e.target.matches('.accept-btn')) {
        card.dataset.status = 'accepted';
        card.classList.add('accepted-card');
        card.classList.remove('rejected-card');
        changeStatus(card, 'accepted');
        // switch to remove member button
        e.target.closest('.request-actions').innerHTML = '<button class="remove-btn" type="button">Remove member</button>';
      } else if (e.target.matches('.reject-btn')) {
        card.dataset.status = 'rejected';
        card.classList.add('rejected-card');
        card.classList.remove('accepted-card');
        changeStatus(card, 'rejected');
        // remove buttons for rejected
        e.target.closest('.request-actions').innerHTML = '';
      } else if (e.target.matches('.remove-btn')) {
        // removing a member marks as removed
        card.dataset.status = 'removed';
        card.classList.remove('accepted-card');
        card.classList.remove('rejected-card');
        changeStatus(card, 'removed');
        e.target.closest('.request-actions').innerHTML = '';
      } else {
        return;
      }
      updateRequestCounts();
      const activeTab = document.querySelector('.request-tab.active');
      if (activeTab) filterRequests(activeTab.dataset.filter);
    });
  }
}

function renderRequests(wrapped) {
  // wrapped is array of {r, i}
  if (!requestList) return;
  requestList.innerHTML = '';
  if (!wrapped || wrapped.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-requests-msg';
    emptyMsg.textContent = 'No join requests yet.';
    requestList.appendChild(emptyMsg);
    requestCards = [];
    updateRequestCounts();
    return;
  }
  wrapped.forEach(({ r: req, i: globalIdx }, idx) => {
    const card = document.createElement('article');
    card.className = 'request-card';
    card.dataset.status = req.status || 'pending';
    card.dataset.studentId = req.studentId || '';
    card.dataset.clubName = req.clubName || '';

    // determine action buttons based on status
    let actionsHTML = '';
    const status = req.status || 'pending';
    if (status === 'pending') {
      actionsHTML = `<button class="accept-btn" type="button">Accept</button>
                     <button class="reject-btn" type="button">Reject</button>`;
    } else if (status === 'accepted') {
      actionsHTML = `<button class="remove-btn" type="button">Remove member</button>`;
    } else if (status === 'rejected') {
      actionsHTML = ''; // No buttons for rejected - user must send new request
    }

    card.innerHTML = `
      <div class="request-main">
        <div class="request-profile">
          <img src="${req.picture}" alt="${req.name}">
        </div>
        <div class="request-info">
          <div class="request-row-top">
            <div class="student-name">${req.name}</div>
            <div class="student-id">${req.studentId}</div>
            <div class="club-name">${req.clubName}</div>
          </div>
        </div>
        <div class="request-actions">
          ${actionsHTML}
        </div>
      </div>
      <div class="request-message-row">
        <div class="request-message">
          ${req.message ? `<strong>Message from ${req.name || 'Unknown'} (${req.studentId || ''}):</strong> ${req.message}` : ''}
        </div>
      </div>
    `;
    requestList.appendChild(card);
  });
  requestCards = document.querySelectorAll('.request-card');
  updateRequestCounts();
  const activeTab = document.querySelector('.request-tab.active');
  if (activeTab) filterRequests(activeTab.dataset.filter);
}


attachGlobalHandlers();

