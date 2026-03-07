// Fetch and display notifications from shared JSON
fetch('get-notifications.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.facility-cards');
    if (!container) return;
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p>No facility or event notifications yet.</p>';
      return;
    }
    container.innerHTML = data.map(n => `
      <div class="card">
        <i class="fa-solid fa-envelope-open-text"></i>
        <h3>${n.title}</h3>
        <p class="desc">${n.message}</p>
        <small>${formatDateTime(n.datetime)}</small>
      </div>
    `).join('');
  })
  .catch(err => {
    const container = document.querySelector('.facility-cards');
    if (container) container.innerHTML = '<p>Error loading notifications.</p>';
  });

function formatDateTime(dt) {
  // Simple formatting: show date and time, or just time if today
  const d = new Date(dt);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `Today ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  // Optionally, add logic for 'Yesterday' etc.
  return d.toLocaleString();
}
