// if already logged in, prevent signup
if (sessionStorage.getItem('currentUser')) {
    window.location.href = 'dashboard.html';
}

document.getElementById("signupForm").addEventListener("submit", function(e) {

    // Toast notification function
    function showToast(message, type = "") {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast show' + (type ? ' toast-' + type : '');
        setTimeout(() => {
            toast.className = 'toast';
        }, 2600);
    }
    e.preventDefault();

    const firstName = document.querySelector("#signupForm input[name='firstName']").value.trim();
    const lastName = document.querySelector("#signupForm input[name='lastName']").value.trim();
    const studentId = document.querySelector("#signupForm input[name='studentId']").value.trim();
    const dob = document.querySelector("#signupForm input[name='dob']").value;
    const email = document.querySelector("#signupForm input[name='email']").value.trim();
    const faculty = document.querySelector("#signupForm select[name='faculty']").value;
    const password = document.querySelector("#signupForm input[name='password']").value;
    const confirmPassword = document.querySelector("#signupForm input[name='confirmPassword']").value;

    if (password !== confirmPassword) {
        showToast("Passwords do not match!", "error");
        return;
    }

    // Send signup data to backend
    fetch("Admin/shared/php/add-user.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&studentId=${encodeURIComponent(studentId)}&dob=${encodeURIComponent(dob)}&email=${encodeURIComponent(email)}&faculty=${encodeURIComponent(faculty)}&password=${encodeURIComponent(password)}`
    })
    .then(resp => resp.json())
    .then(result => {
        if (result.success) {
            showToast("Account created successfully! Please log in.", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1800);
        } else {
            showToast(result.error || "Signup failed.", "error");
        }
    })
    .catch(err => {
        console.error("Signup error", err);
        showToast("An error occurred. Please try again later.", "error");
    });
});
