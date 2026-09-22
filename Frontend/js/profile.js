const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

const urlParams =
    new URLSearchParams(window.location.search);

const viewedUserId =
    urlParams.get("id");

const isOwnProfile =
    !viewedUserId;

if (!token) {
    window.location.href = "login.html";
}


// ===============================
// Elements
// ===============================

const profileName =
    document.getElementById("profileName");

const profileUsername =
    document.getElementById("profileUsername");

const profileBio =
    document.getElementById("profileBio");

const profileAvatar =
    document.getElementById("profileAvatar");

const postCount =
    document.getElementById("postCount");

const profilePosts =
    document.getElementById("profilePosts");

const editProfileBtn =
    document.getElementById("editProfileBtn");

    const followBtn =
    document.getElementById("followBtn");

    if (!isOwnProfile) {

    editProfileBtn.style.display = "none";

    followBtn.style.display = "inline-block";

    loadFollowStatus();

} else {

    followBtn.style.display = "none";
}

const editProfileCard =
    document.getElementById("editProfileCard");

const profileForm =
    document.getElementById("profileForm");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// ===============================
// Load Profile
// ===============================

async function loadProfile() {

    try {

        const response = await fetch(
            isOwnProfile
    ? `${API_URL}/users/profile`
    : `${API_URL}/users/profile/${viewedUserId}`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to load profile."
            );

            return;
        }


        const user = data.user;

        const posts = data.posts || [];


        // Profile information

        profileName.textContent =
            user.name;

        profileUsername.textContent =
            `@${user.username}`;

        profileBio.textContent =
            user.bio ||
            "No bio added yet.";


        // Avatar

        if (user.profileImage) {

            profileAvatar.innerHTML = `
                <img
                    src="${user.profileImage}"
                    alt="Profile"
                >
            `;

        } else {

            profileAvatar.textContent =
                user.name
                    .charAt(0)
                    .toUpperCase();
        }


        // Post count

        postCount.textContent =
            posts.length;

            document.getElementById(
    "followerCount"
).textContent =
    user.followers?.length || 0;

document.getElementById(
    "followingCount"
).textContent =
    user.following?.length || 0;


        // Edit form values

        if (isOwnProfile) {

    document.getElementById(
        "nameInput"
    ).value = user.name;

    document.getElementById(
        "usernameInput"
    ).value = user.username;

    document.getElementById(
        "bioInput"
    ).value = user.bio || "";

    document.getElementById(
        "profileImageInput"
    ).value =
        user.profileImage || "";
}


        // Save updated user locally

        const storedUser =
            JSON.parse(
                localStorage.getItem("user") || "{}"
            );

        const updatedUser = {
            ...storedUser,
            ...user
        };

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );


        // Display posts

        displayPosts(posts);

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// ===============================
// Load Follow Status
// ===============================

async function loadFollowStatus() {

    try {

        const response = await fetch(
            `${API_URL}/users/${viewedUserId}/follow-status`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                data.message ||
                "Failed to load follow status."
            );

            return;
        }


        updateFollowButton(
            data.following
        );


        // Update counts

        document.getElementById(
            "followerCount"
        ).textContent =
            data.followersCount;


        document.getElementById(
            "followingCount"
        ).textContent =
            data.followingCount;


    } catch (error) {

        console.error(
            "Follow status error:",
            error
        );
    }
}


// ===============================
// Update Follow Button
// ===============================

function updateFollowButton(isFollowing) {

    if (isFollowing) {

        followBtn.textContent =
            "Following";

        followBtn.classList.add(
            "following"
        );

    } else {

        followBtn.textContent =
            "Follow";

        followBtn.classList.remove(
            "following"
        );
    }
}


// ===============================
// Follow / Unfollow
// ===============================

followBtn.addEventListener(
    "click",
    async () => {

        if (!viewedUserId) {
            return;
        }


        const isFollowing =
            followBtn.classList.contains(
                "following"
            );


        const endpoint =
            isFollowing
                ? "unfollow"
                : "follow";


        followBtn.disabled = true;

        followBtn.textContent =
            isFollowing
                ? "Unfollowing..."
                : "Following...";


        try {

            const response =
                await fetch(
                    `${API_URL}/users/${viewedUserId}/${endpoint}`,
                    {
                        method: "PUT",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Something went wrong."
                );

                return;
            }


            updateFollowButton(
                data.following
            );


            document.getElementById(
                "followerCount"
            ).textContent =
                data.followersCount;


            // Small feedback

            console.log(
                data.message
            );


        } catch (error) {

            console.error(
                "Follow error:",
                error
            );

            alert(
                "Unable to connect to server."
            );

        } finally {

            followBtn.disabled = false;
        }
    }
);


// ===============================
// Display Posts
// ===============================

function displayPosts(posts) {

    profilePosts.innerHTML = "";

    if (posts.length === 0) {

        profilePosts.innerHTML = `
            <div class="post-card">
                <p>
                    You haven't created any posts yet.
                </p>
            </div>
        `;

        return;
    }


    posts.forEach(post => {

        const article =
            document.createElement("article");

        article.className =
            "post-card";

        article.innerHTML = `
            <div class="post-header">

                <div class="user-avatar">
                    ${escapeHTML(
                        post.author?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"
                    )}
                </div>

                <div class="post-user">

                    <h3>
                        ${escapeHTML(
                            post.author?.name ||
                            "User"
                        )}
                    </h3>

                    <p>
                        @${escapeHTML(
                            post.author?.username ||
                            "user"
                        )}
                    </p>

                </div>

            </div>

            <div class="post-content">

                <p>
                    ${escapeHTML(
                        post.content
                    )}
                </p>

            </div>
        `;

        profilePosts.appendChild(article);

    });
}


// ===============================
// Open Edit Profile
// ===============================

editProfileBtn.addEventListener(
    "click",
    () => {

        editProfileCard.classList.add(
            "show"
        );

        editProfileCard.scrollIntoView({
            behavior: "smooth"
        });
    }
);


// ===============================
// Cancel Edit
// ===============================

cancelEditBtn.addEventListener(
    "click",
    () => {

        editProfileCard.classList.remove(
            "show"
        );
    }
);


// ===============================
// Update Profile
// ===============================

profileForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            document.getElementById(
                "nameInput"
            ).value.trim();

        const username =
            document.getElementById(
                "usernameInput"
            ).value.trim();

        const bio =
            document.getElementById(
                "bioInput"
            ).value.trim();

        const profileImage =
            document.getElementById(
                "profileImageInput"
            ).value.trim();


        if (!name || !username) {

            alert(
                "Name and username are required."
            );

            return;
        }


        const saveBtn =
            document.getElementById(
                "saveProfileBtn"
            );

        saveBtn.disabled = true;

        saveBtn.textContent =
            "Saving...";


        try {

            const response =
                await fetch(
                    `${API_URL}/users/profile`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            name,
                            username,
                            bio,
                            profileImage
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to update profile."
                );

                return;
            }


            alert(
                "Profile updated successfully!"
            );


            editProfileCard.classList.remove(
                "show"
            );


            await loadProfile();

        } catch (error) {

            console.error(
                "Update profile error:",
                error
            );

            alert(
                "Unable to connect to server."
            );

        } finally {

            saveBtn.disabled = false;

            saveBtn.textContent =
                "Save Changes";
        }
    }
);


// ===============================
// Logout
// ===============================

logoutBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "login.html";
    }
);


// ===============================
// Escape HTML
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ===============================
// Start
// ===============================

loadProfile();