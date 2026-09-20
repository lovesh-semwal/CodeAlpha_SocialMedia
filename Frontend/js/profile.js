const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");


// Protect profile
if (!token || !userData) {
    window.location.href = "login.html";
}


const user = JSON.parse(userData);


// Profile name
document.getElementById("profileName").textContent =
    user.name;


// Username
document.getElementById("profileUsername").textContent =
    `@${user.username}`;


// Bio
document.getElementById("profileBio").textContent =
    user.bio || "No bio yet.";


// Avatar
document.getElementById("profileAvatar").textContent =
    user.name.charAt(0).toUpperCase();


// Logout
document.getElementById("logoutBtn").addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";
    }
);