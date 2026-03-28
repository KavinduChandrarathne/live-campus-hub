function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Toast helper (styled message instead of alert)
function showToast(message, duration = 2600) {
  const toast = document.getElementById('toast');
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.style.background = '#28a745';
  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }, duration);
}

const joinList = document.getElementById('joinRequestList');

function renderJoinRequests(requests) {
  joinList.innerHTML = '';
  if (!requests || requests.length === 0) {
    joinList.innerHTML = '<div class="no-requests" style="padding:12px;color:#55687f;">No pending requests.</div>';
    return;
  }
  requests.forEach(r => {
    const card = document.createElement('article');
    card.className = 'request-card';
    const pic = r.picture || './images/admin.png';
    card.innerHTML = `
      <img src="${pic}" class="avatar" alt="avatar">
      <div class="request-info">
        <strong>${r.firstName ? r.firstName + ' ' + r.lastName : r.username}</strong>
        <small>${r.email || ''}</small>
        <small>${r.faculty || ''}</small>
      </div>
      <div class="req-actions">
        <button class="btn accept" data-id="${r.id}">Accept</button>
        <button class="btn reject" data-id="${r.id}">Reject</button>
      </div>
    `;
    joinList.appendChild(card);
  });
  // attach handlers
  joinList.querySelectorAll('.req-actions .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const action = btn.classList.contains('accept') ? 'accept' : 'reject';
      handleJoinAction(id, action);
    });
  });
}

function handleJoinAction(id, action) {
  const form = new FormData();
  form.append('id', id);
  form.append('action', action);
  fetch('shared/php/update-transit-join-request.php', {
    method: 'POST',
    body: form
  })
    .then(r => r.json())
    .then(resp => {
      if (resp.success) {
        loadRequests();
        // if an acceptance happened we also need to refresh the joined users section
        if (action === 'accept') {
          loadJoinedUsers();
        }
        showToast('Request updated successfully');
      } else {
        showToast('Error: ' + (resp.error || 'unknown'));
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Request failed');
    });
}

function loadRequests() {
  const route = getQueryParam('route') || '';
  // fetch pending requests
  fetch('shared/php/get-transit-join-requests.php')
    .then(r => r.json())
    .then(arr => {
      const filtered = arr.filter(r => r.status === 'pending' && r.route === route);
      renderJoinRequests(filtered);
    })
    .catch(err => {
      console.error('failed to load join requests', err);
    });
}

function loadJoinedUsers() {
  const route = getQueryParam('route') || '';
  const joinedEl = document.getElementById('joinedList');
  if (!joinedEl) return;
  joinedEl.innerHTML = '';
  if (!route) return;

  fetch(`shared/php/get-route-joined-users.php?route=${encodeURIComponent(route)}`)
    .then(r => r.json())
    .then(arr => {
      if (arr.length === 0) {
        joinedEl.innerHTML = '<div class="no-requests" style="padding:12px;color:#55687f;">No users joined yet.</div>';
        return;
      }
      arr.forEach(u => {
        const card = document.createElement('article');
        card.className = 'request-card';
        const pic = u.picture || './images/admin.png';
        card.innerHTML = `
          <img src="${pic}" class="avatar" alt="avatar">
          <div class="request-info">
            <strong>${u.firstName ? u.firstName + ' ' + u.lastName : u.username}</strong>
            <small>${u.email || ''}</small>
            <small>${u.faculty || ''}</small>
          </div>
          <div class="req-actions">
            <button class="btn reject" data-user="${u.username}">Remove</button>
          </div>
        `;
        joinedEl.appendChild(card);
      });
      joinedEl.querySelectorAll('.req-actions .btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const uname = btn.dataset.user;
          removeJoinedUser(uname);
        });
      });
    })
    .catch(err => console.error('failed to load joined users', err));
}

function removeJoinedUser(username) {
  const route = getQueryParam('route') || '';
  const form = new FormData();
  form.append('route', route);
  form.append('username', username);
  fetch('shared/php/remove-route-user.php', {
    method: 'POST',
    body: form
  })
    .then(r => r.json())
    .then(resp => {
      if (resp.success) {
        loadJoinedUsers();
        loadRequests();
        showToast('User removed from route successfully');
      } else {
        showToast('Error: ' + (resp.error || 'unknown'));
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Request failed');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const route = getQueryParam('route');
  const pageTitle = document.getElementById('pageTitle');
  if (route) {
    pageTitle.textContent = `${route} - Join Requests`;
  } else {
    pageTitle.textContent = 'Join Requests';
  }

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      history.back();
    });
  }

  let pendingRoutes = [];

  function initCards() {
    const user = getCurrentUser();
    const joined = user?.joinedRoutes || [];

    document.querySelectorAll('.transit-card').forEach(card => {
      const locationName = card.dataset.location || card.querySelector('.place h3')?.textContent || 'Gampaha';
      const btnRoute = card.querySelector('.btn-route');
      const btnUpdate = card.querySelector('.btn-update');
      const isJoined = joined.includes(locationName);
      const isPending = pendingRoutes.includes(locationName);

      card.classList.remove('locked');
      if (btnRoute) btnRoute.replaceWith(btnRoute.cloneNode(true));
      if (btnUpdate) btnUpdate.replaceWith(btnUpdate.cloneNode(true));

      if (!isJoined) {
        card.classList.add('locked');
        const allBtns = [];
        const routeBtn = card.querySelector('.btn-route');
        const updateBtn = card.querySelector('.btn-update');
        if (routeBtn) allBtns.push(routeBtn);
        if (updateBtn) allBtns.push(updateBtn);

        if (isPending) {
          allBtns.forEach(b => {
            b.textContent = 'Requested';
            b.disabled = true;
          });
        } else {
          function sendJoinRequest() {
            if (allBtns.some(b => b.disabled)) return;
            const username = user.username || user.email || '';
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
            b.addEventListener('click', sendJoinRequest);
          });
        }
        return;
      }

      if (btnRoute) {
        btnRoute.addEventListener('click', () => {
          window.location.href = `bus-route.html?loc=${encodeURIComponent(locationName)}`;
        });
      }
      if (btnUpdate) {
        btnUpdate.addEventListener('click', () => {
          window.location.href = `location-updates.html?loc=${encodeURIComponent(locationName)}`;
        });
      }
    });
  }

  function loadPending(callback) {
    const user = getCurrentUser();
    if (!user) {
      if (callback) callback();
      return;
    }
    const uname = encodeURIComponent(user.username || user.email || '');
    fetch(`Admin/shared/php/get-user-transit-join-requests.php?username=${uname}`)
      .then(r => r.json())
      .then(arr => {
        pendingRoutes = arr.map(r => r.route);
      })
      .catch(() => {})
      .finally(() => {
        if (callback) callback();
      });
  }

  // initial load
  loadRequests();
  loadJoinedUsers();
  loadPending(initCards);

  // when user record refreshes, recompute pending + cards + joined list
  window.addEventListener('currentUserUpdated', () => {
    loadPending(initCards);
    loadJoinedUsers();
  });
});