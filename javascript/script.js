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
    const payload = { email, password };

    fetch('api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(resp => resp.json())
        .then(result => {
            if (result.success && result.user && result.token) {
                // store user and auth token for session
                sessionStorage.setItem('currentUser', JSON.stringify(result.user));
                sessionStorage.setItem('authToken', result.token);

                fetch('api/users/current', {
                    headers: {
                        'Authorization': 'Bearer ' + result.token
                    }
                })
                .then(resp => resp.json())
                .then(userResult => {
                    if (userResult.success && userResult.data) {
                        sessionStorage.setItem('currentUser', JSON.stringify(userResult.data));
                        window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: userResult.data }));
                    }
                    window.location.href = 'dashboard.html';
                })
                .catch(err => {
                    console.error('User refresh failed', err);
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
