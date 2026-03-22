// if already logged in, skip to dashboard
if (sessionStorage.getItem('currentUser')) {
    window.location.href = 'dashboard.html';
}

function showToast(message, type = 'success') {
    let toast = document.getElementById('rewardToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'rewardToast';
        toast.className = 'reward-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show', type);
    setTimeout(() => {
        toast.classList.remove('show', 'success', 'error');
    }, 2600);
}

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    // grab inputs
    const email = document.querySelector("#loginForm input[type='email']").value.trim();
    const password = document.querySelector("#loginForm input[type='password']").value;

    // fetch the sample users JSON
    fetch("Admin/shared/json/users.json")
        .then(resp => resp.json())
        .then(users => {
            const match = users.find(u =>
                (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase())
            );

            if (!match) {
                alert("No account found with that email/username.");
                return;
            }

            if (match.password !== password) {
                alert("Incorrect password.");
                return;
            }

            // store user for session
            sessionStorage.setItem('currentUser', JSON.stringify(match));

            // daily login reward update and get updated user data
            fetch('Admin/shared/php/update-user-rewards.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `email=${encodeURIComponent(match.email)}&action=dailyLogin`
            })
            .then(resp => resp.json())
            .then(result => {
                if (result.success && result.user) {
                    sessionStorage.setItem('currentUser', JSON.stringify(result.user));
                    window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: result.user }));
                    showToast(result.message || 'Login reward processed', 'success');
                } else if (result.error) {
                    showToast(result.error, 'error');
                }
                window.location.href = 'dashboard.html';
            })
            .catch(err => {
                console.error('Reward update failed', err);
                window.location.href = 'dashboard.html';
            });
        })
        .catch(err => {
            console.error("Failed to load users.json", err);
            alert("An error occurred. Please try again later.");
        });
});
