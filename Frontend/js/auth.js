const API_URL = "http://localhost:5000/api";

// Register
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

        try {
            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        username,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                message.style.color = "green";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            } else {
                message.style.color = "red";
            }

        } catch (error) {
            console.log(error);

            message.textContent = "Something went wrong.";
            message.style.color = "red";
        }
    });
}


// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                message.style.color = "green";

                // Save JWT
                localStorage.setItem("token", data.token);

                // Save user
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);

            } else {
                message.style.color = "red";
            }

        } catch (error) {
            console.log(error);

            message.textContent = "Something went wrong.";
            message.style.color = "red";
        }
    });
}