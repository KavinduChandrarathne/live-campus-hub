// if already logged in, prevent signup
if (sessionStorage.getItem('currentUser')) {
    window.location.href = 'dashboard.html';
}

document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.querySelector("#signupForm input[type='email']").value.trim();
    const password = document.querySelectorAll("#signupForm input[type='password']")[0].value;
    const confirmPassword = document.querySelectorAll("#signupForm input[type='password']")[1].value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // For testing we only allow users already present in users.json
    fetch("./javascript/users.json")
        .then(resp => resp.json())
        .then(users => {
            const match = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!match) {
                alert("Sign up is disabled for new users in this demo. Use an existing account.");
                return;
            }

            if (match.password !== password) {
                alert("The password does not match the existing account.");
                return;
            }

            // set session user
            sessionStorage.setItem('currentUser', JSON.stringify(match));
            alert("Login successful (demo)!");
            window.location.href = "dashboard.html";
        })
        .catch(err => {
            console.error("Failed to load users.json", err);
            alert("An error occurred. Please try again later.");
        });
});
