// if already logged in, skip to dashboard
if (sessionStorage.getItem('currentUser')) {
    window.location.href = 'dashboard.html';
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

            // success, redirect
            window.location.href = "dashboard.html";
        })
        .catch(err => {
            console.error("Failed to load users.json", err);
            alert("An error occurred. Please try again later.");
        });
});
