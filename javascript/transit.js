// Attach click handlers to transit cards and enforce join permissions
// this module depends on common.js for getCurrentUser()

function showToast(message, duration = 2600) {
  const toast = document.getElementById('toast');
  if (!toast) {
    console.log('[toast]', message);
    return;
  }
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  toast.style.bottom = '32px';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.bottom = '20px';
    setTimeout(() => {
      toast.style.display = 'none';
      toast.style.bottom = '32px';
    }, 300);
  }, duration);
}

document.addEventListener('DOMContentLoaded', () => {
  let pendingRoutes = [];

  function initCards() {
    const user = getCurrentUser();
    const joined = user?.joinedRoutes || [];

    document.querySelectorAll(".transit-card").forEach(card => {
      const locationName = card.dataset.location || card.querySelector('.place h3')?.textContent || 'Gampaha';
      const btnRoute = card.querySelector(".btn-route");
      const btnUpdate = card.querySelector(".btn-update");
      const isJoined = joined.includes(locationName);
      // if already joined we should never show a pending indicator
      const isPending = !isJoined && pendingRoutes.includes(locationName);

      card.classList.remove('locked');
      if (btnRoute) btnRoute.replaceWith(btnRoute.cloneNode(true));
      if (btnUpdate) btnUpdate.replaceWith(btnUpdate.cloneNode(true));

      // After cloning, re-query the buttons so we update text below
      const routeBtn = card.querySelector('.btn-route');
      const updateBtn = card.querySelector('.btn-update');

      if (!isJoined) {
        card.classList.add('locked');
        const allBtns = [];
        if (routeBtn) allBtns.push(routeBtn);
        if (updateBtn) allBtns.push(updateBtn);

        if (isPending) {
          allBtns.forEach(b => {
            b.textContent = 'Requested';
            b.disabled = true;
          });
        } else {
          // ensure we always operate on the freshest user record
          async function sendJoinRequest() {
            if (allBtns.some(b => b.disabled)) return;
            // grab the latest copy so the username is correct
            const fresh = await refreshCurrentUser();
            const username = fresh?.username || fresh?.email || '';
            const form = new FormData();
            form.append('route', locationName);
            form.append('username', username);
            fetch('Admin/shared/php/add-transit-join-request.php', {
              method: 'POST',
              body: form
            })
              .then(r => r.json())
              .then(resp => {
                if (resp.success) {
                  allBtns.forEach(b => {
                    b.textContent = 'Requested';
                    b.disabled = true;
                  });
                  pendingRoutes.push(locationName);
                  showToast('Your join request has been submitted!');
                  // update UI in case something changed on server
                  loadPending(initCards);
                } else {
                  showToast('Error: ' + (resp.error || 'unknown'));
                }
              })
              .catch(err => {
                console.error(err);
                showToast('Request failed');
              });
          }

          allBtns.forEach(b => {
            b.textContent = 'Request to Join';
            b.disabled = false;
            b.addEventListener('click', sendJoinRequest);
          });
        }
        return;
      }

      // joined state: make sure buttons show correct labels and enabled behaviour
      if (routeBtn) {
        routeBtn.textContent = 'View location updates';
        routeBtn.disabled = false;
      }
      if (updateBtn) {
        updateBtn.textContent = 'View live location';
        updateBtn.disabled = false;
      }

      if (routeBtn) {
        routeBtn.addEventListener("click", async (e) => {
          // membership might have changed; refresh and re-evaluate
          const fresh = await refreshCurrentUser();
          const stillJoined = (fresh?.joinedRoutes || []).includes(locationName);
          if (!stillJoined) {
            // re-render UI to show request button and avoid navigation
            loadPending(initCards);
            e.preventDefault();
            return;
          }
          window.location.href = `bus-route.html?loc=${encodeURIComponent(locationName)}`;
        });
      }
      if (updateBtn) {
        updateBtn.addEventListener("click", async (e) => {
          const fresh = await refreshCurrentUser();
          const stillJoined = (fresh?.joinedRoutes || []).includes(locationName);
          if (!stillJoined) {
            loadPending(initCards);
            e.preventDefault();
            return;
          }
          window.location.href = `location-updates.html?loc=${encodeURIComponent(locationName)}`;
        });
      }
    });
  }

  function loadPending(cb) {
    const user = getCurrentUser();
    if (!user) {
      if (cb) cb();
      return;
    }
    const uname = encodeURIComponent(user.username || user.email || '');
    // bust browser cache by adding timestamp
    fetch(`Admin/shared/php/get-user-transit-join-requests.php?username=${uname}&t=${Date.now()}`)
      .then(r => r.json())
      .then(arr => {
        pendingRoutes = arr.map(r => r.route);
      })
      .catch(() => {})
      .finally(() => {
        if (cb) cb();
      });
  }

  async function initPage() {
    // make sure we have a fresh user record before drawing cards
    await refreshCurrentUser();
    loadPending(initCards);
  }

  // initial draw
  initPage();

  // open SSE connection to get immediate notifications when the user file changes
  const user = getCurrentUser();
  if (user) {
    try {
      const uname = encodeURIComponent(user.username || user.email || '');
      const es = new EventSource(`Admin/shared/php/user-updates-sse.php?username=${uname}`);
      es.addEventListener('userupdate', () => {
        scheduleRefresh();
      });
      // fallback to close on page unload
      window.addEventListener('beforeunload', () => es.close());
    } catch (e) {
      console.warn('SSE not available', e);
    }
  }

  // if the stored user object is updated later (e.g. admin accepted/removed),
  // refetch the latest record before rebuilding the cards so we don't render
  // using stale data (which could keep a route marked as joined).
  window.addEventListener('currentUserUpdated', async () => {
    const updated = await refreshCurrentUser();
    // remove any pending entries for routes we are now joined to
    if (updated && Array.isArray(updated.joinedRoutes)) {
      pendingRoutes = pendingRoutes.filter(r => !updated.joinedRoutes.includes(r));
    }
    loadPending(initCards);
  });

  // periodically refresh in case admin changes membership while page is open
  function scheduleRefresh() {
    refreshCurrentUser().then(() => loadPending(initCards));
  }
  setInterval(scheduleRefresh, 3000); // every 3 seconds for near-instant updates
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleRefresh();
  });
});
