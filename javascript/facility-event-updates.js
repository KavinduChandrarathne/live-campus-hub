// Fetch and display facility & event updates
fetch('Admin/shared/php/get-facility-event-updates.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.facility-cards');
    if (!container) return;
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p>No facility or event updates yet.</p>';
      return;
    }
    container.innerHTML = data.map(u => `
      <div class="card" data-datetime="${u.datetime}" data-message="${u.message}">
        <i class="fa-solid ${u.icon || 'fa-envelope'}"></i>
        <h3>${u.message}</h3>
        <p class="desc">${u.description || ''}</p>
        <small>${formatDateTime(u.datetime)}</small>
      </div>
    `).join('');

    // Check if there's a notification to highlight
    const highlight = sessionStorage.getItem('highlightUpdate');
    if (highlight) {
      try {
        const highlightData = JSON.parse(highlight);
        const matchingCard = container.querySelector(
          `[data-datetime="${highlightData.datetime}"]`
        );
        if (matchingCard) {
          matchingCard.style.backgroundColor = '#fff3cd';
          matchingCard.style.borderLeft = '4px solid #ffc107';
          setTimeout(() => {
            matchingCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
        sessionStorage.removeItem('highlightUpdate');
      } catch (e) {
        console.error('Error highlighting update:', e);
      }
    }
  })
  .catch(err => {
    const container = document.querySelector('.facility-cards');
    if (container) container.innerHTML = '<p>Error loading updates.</p>';
  });

function formatDateTime(dt) {
  const d = new Date(dt.replace(/-/g, '/'));
  const now = new Date();
  let h = d.getHours();
  let m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  if (d.toDateString() === now.toDateString()) {
    return `Today ${h}:${m} ${ampm}`;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day} ${h}:${m} ${ampm}`;
}
