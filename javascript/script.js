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

    // fetch from new database login API endpoint
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    fetch("Admin/shared/php/api-login.php", {
        method: 'POST',
        body: formData
    })
        .then(resp => resp.json())
        .then(result => {
            if (result.success && result.user) {
                // store user for session
                sessionStorage.setItem('currentUser', JSON.stringify(result.user));

                // daily login reward update and get updated user data
                fetch('Admin/shared/php/update-user-rewards.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `email=${encodeURIComponent(result.user.email)}&action=dailyLogin`
                })
                .then(resp => resp.json())
                .then(rewardResult => {
                    if (rewardResult.success && rewardResult.user) {
                        sessionStorage.setItem('currentUser', JSON.stringify(rewardResult.user));
                        window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: rewardResult.user }));
                        showToast(rewardResult.message || 'Login reward processed', 'success');
                    } else if (rewardResult.error) {
                        showToast(rewardResult.error, 'error');
                    }
                    window.location.href = 'dashboard.html';
                })
                .catch(err => {
                    console.error('Reward update failed', err);
                    window.location.href = 'dashboard.html';
                });
            } else {
                alert(result.error || 'Login failed');
            }
        })
        .catch(err => {
            console.error("Login request failed", err);
            alert("An error occurred. Please try again later.");
        });
});
