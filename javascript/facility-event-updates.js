// Fetch and display facility & event updates
fetch('get-facility-event-updates.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.facility-cards');
    if (!container) return;
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p>No facility or event updates yet.</p>';
      return;
    }
    container.innerHTML = data.map(u => `
      <div class="card">
        <i class="fa-solid ${u.icon || 'fa-envelope'}"></i>
        <h3>${u.message}</h3>
        <p class="desc">${u.description || ''}</p>
        <small>${formatDateTime(u.datetime)}</small>
      </div>
    `).join('');
  })
  .catch(err => {
    const container = document.querySelector('.facility-cards');
    if (container) container.innerHTML = '<p>Error loading updates.</p>';
  });

function formatDateTime(dt) {
  const d = new Date(dt);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `Today ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  return d.toLocaleString();
}
