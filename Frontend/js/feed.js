const API_URL = "http://localhost:5000/api";


// =========================
// Get Login Data
// =========================

const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");


// =========================
// Check Authentication
// =========================

if (!token || !userData) {
    window.location.href = "login.html";
}


// Convert stored user JSON into object
const user = JSON.parse(userData);


// =========================
// Display User Information
// =========================

// Welcome text
const welcomeText = document.getElementById("welcomeText");

if (welcomeText) {
    welcomeText.textContent = `Welcome to ConnectHub, ${user.name}`;
}


// User name above create-post box
const postUserName = document.getElementById("postUserName");

if (postUserName) {
    postUserName.textContent = user.name;
}


// User avatar
const userAvatar = document.getElementById("userAvatar");

if (userAvatar) {
    userAvatar.textContent = user.name
        .charAt(0)
        .toUpperCase();
}


// =========================
// Logout
// =========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";

    });

}


// =========================
// Create Post
// =========================

const createPostBtn =
    document.getElementById("createPostBtn");

const postContent =
    document.getElementById("postContent");


if (createPostBtn) {

    createPostBtn.addEventListener("click", async () => {

        const content = postContent.value.trim();


        // Check empty post
        if (!content) {

            alert("Please write something first.");

            return;
        }


        // Disable button while posting
        createPostBtn.disabled = true;

        createPostBtn.textContent = "Posting...";


        try {

            const response = await fetch(
                `${API_URL}/posts`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        content: content
                    })
                }
            );


            const data = await response.json();


            // Check API error
            if (!response.ok) {

                alert(data.message || "Failed to create post.");

                return;
            }


            // Clear textarea
            postContent.value = "";


            // Reload feed
            await loadPosts();


        } catch (error) {

            console.error("Create post error:", error);

            alert("Unable to connect to the server.");

        } finally {

            // Enable button again
            createPostBtn.disabled = false;

            createPostBtn.textContent = "Post";

        }

    });

}


// ===============================
// User Search
// ===============================

const userSearchInput =
    document.getElementById("userSearchInput");

const searchResults =
    document.getElementById("searchResults");


if (userSearchInput) {

    userSearchInput.addEventListener(
        "input",
        async () => {

            const query =
                userSearchInput.value.trim();


            if (!query) {

                searchResults.innerHTML = "";

                searchResults.classList.remove(
                    "show"
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/users/search?q=${encodeURIComponent(query)}`,
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

                    searchResults.innerHTML = `
                        <p class="search-message">
                            ${escapeHTML(
                                data.message ||
                                "Search failed."
                            )}
                        </p>
                    `;

                    searchResults.classList.add(
                        "show"
                    );

                    return;
                }


                displaySearchResults(
                    data.users || []
                );


            } catch (error) {

                console.error(
                    "User search error:",
                    error
                );

                searchResults.innerHTML = `
                    <p class="search-message">
                        Unable to search users.
                    </p>
                `;

                searchResults.classList.add(
                    "show"
                );
            }
        }
    );
}


// ===============================
// Display Search Results
// ===============================

function displaySearchResults(users) {

    searchResults.innerHTML = "";


    if (users.length === 0) {

        searchResults.innerHTML = `
            <p class="search-message">
                No users found.
            </p>
        `;

        searchResults.classList.add(
            "show"
        );

        return;
    }


    users.forEach(foundUser => {

        const userElement =
            document.createElement("div");

        userElement.className =
            "search-user";


        const firstLetter =
            foundUser.name
                ?.charAt(0)
                ?.toUpperCase() || "U";


        userElement.innerHTML = `

            <div class="search-user-avatar">

                ${
                    foundUser.profileImage
                    ? `
                        <img
                            src="${escapeHTML(
                                foundUser.profileImage
                            )}"
                            alt="Profile"
                        >
                    `
                    : firstLetter
                }

            </div>


            <div class="search-user-info">

                <strong>
                    ${escapeHTML(
                        foundUser.name
                    )}
                </strong>

                <span>
                    @${escapeHTML(
                        foundUser.username
                    )}
                </span>

            </div>

        `;


        userElement.addEventListener(
            "click",
            () => {

                window.location.href =
                    `profile.html?id=${foundUser._id}`;
            }
        );


        searchResults.appendChild(
            userElement
        );

    });


    searchResults.classList.add(
        "show"
    );
}


// ===============================
// Close Search
// ===============================

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".search-container"
            )
        ) {

            searchResults?.classList.remove(
                "show"
            );
        }
    }
);


// =========================
// Load Posts
// =========================

async function loadPosts() {

    const feed = document.getElementById("feed");


    if (!feed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/posts`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        // Check API error
        if (!response.ok) {

            feed.innerHTML = `
                <div class="post-card">
                    <p>
                        ${data.message || "Failed to load posts."}
                    </p>
                </div>
            `;

            return;
        }


        // Clear existing posts
        feed.innerHTML = "";


        // No posts
        if (!data.posts || data.posts.length === 0) {

            feed.innerHTML = `
                <div class="post-card">
                    <p>
                        No posts yet. Be the first to post!
                    </p>
                </div>
            `;

            return;
        }


        // Display every post
        data.posts.forEach(post => {

            const postElement =
                createPostElement(post);

            feed.appendChild(postElement);

        });


    } catch (error) {

        console.error("Load posts error:", error);


        feed.innerHTML = `
            <div class="post-card">
                <p>
                    Failed to load posts.
                    Please make sure the backend is running.
                </p>
            </div>
        `;

    }

}


// =========================
// Create Post HTML
// =========================

function createPostElement(post) {

    const article = document.createElement("article");

    article.className = "post-card";

    const authorName =
        post.author?.name || "Unknown User";

    const username =
        post.author?.username || "user";

    const firstLetter =
        authorName.charAt(0).toUpperCase();

    const likesCount =
        post.likes?.length || 0;

    const currentUserId =
        user._id || user.id;

    const postAuthorId =
        post.author?._id;

    const isOwner =
        postAuthorId &&
        postAuthorId.toString() ===
        currentUserId.toString();

    const isLiked =
        post.likes?.some(
            id => id.toString() ===
                currentUserId.toString()
        );

    const postDate =
        formatPostDate(post.createdAt);


    article.innerHTML = `
        <div class="post-header">

            <div class="user-avatar">
                ${firstLetter}
            </div>

            <div class="post-user">

                <h3>
                    ${escapeHTML(authorName)}
                </h3>

                <p>
                    @${escapeHTML(username)}
                    · ${postDate}
                </p>

            </div>

            ${
                isOwner
                    ? `
                    <div class="post-menu">

                        <button
                            class="edit-post-btn"
                        >
                            ✏️
                        </button>

                        <button
                            class="delete-post-btn"
                        >
                            🗑️
                        </button>

                    </div>
                    `
                    : ""
            }

        </div>


        <div class="post-content">

            <p class="post-text">
                ${escapeHTML(post.content)}
            </p>

        </div>


        <div class="post-actions">

            <button
                class="like-btn ${isLiked ? "liked" : ""}"
            >
                ❤️ Like

                <span class="like-count">
                    ${likesCount}
                </span>

            </button>


            <button class="comment-btn">
                💬 Comment
            </button>


            <button class="share-btn">
                ↗ Share
            </button>

        </div>


        <div class="comments-section">

            <div class="comment-form">

                <input
                    type="text"
                    class="comment-input"
                    placeholder="Write a comment..."
                    maxlength="500"
                />

                <button
                    class="comment-submit-btn"
                >
                    Post
                </button>

            </div>


            <div class="comments-list">

                <p class="comments-loading">
                    Click Comment to load comments.
                </p>

            </div>

        </div>
    `;


    // ===============================
    // Like
    // ===============================

    const likeBtn =
        article.querySelector(".like-btn");

    likeBtn.addEventListener(
        "click",
        () => {
            handleLike(
                post._id,
                likeBtn
            );
        }
    );


    // ===============================
    // Comments
    // ===============================

    const commentBtn =
        article.querySelector(".comment-btn");

    const commentsSection =
        article.querySelector(
            ".comments-section"
        );

    commentBtn.addEventListener(
        "click",
        () => {

            commentsSection.classList.toggle(
                "show"
            );

            if (
                commentsSection.classList.contains(
                    "show"
                )
            ) {

                loadComments(
                    post._id,
                    article
                );
            }
        }
    );


    const commentSubmitBtn =
        article.querySelector(
            ".comment-submit-btn"
        );

    const commentInput =
        article.querySelector(
            ".comment-input"
        );


    commentSubmitBtn.addEventListener(
        "click",
        () => {

            handleCommentSubmit(
                post._id,
                article
            );
        }
    );


    commentInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                handleCommentSubmit(
                    post._id,
                    article
                );
            }
        }
    );


    // ===============================
    // Edit Post
    // ===============================

    if (isOwner) {

        const editBtn =
            article.querySelector(
                ".edit-post-btn"
            );

        editBtn.addEventListener(
            "click",
            () => {

                editPost(
                    post._id,
                    article,
                    post.content
                );
            }
        );


        // ===============================
        // Delete Post
        // ===============================

        const deleteBtn =
            article.querySelector(
                ".delete-post-btn"
            );

        deleteBtn.addEventListener(
            "click",
            () => {

                deletePost(
                    post._id
                );
            }
        );
    }


    return article;
}


async function loadComments(postId, article) {

    const commentsList =
        article.querySelector(".comments-list");


    commentsList.innerHTML = `
        <p class="comments-loading">
            Loading comments...
        </p>
    `;


    try {

        const response = await fetch(
            `${API_URL}/posts/${postId}/comments`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            commentsList.innerHTML = `
                <p>
                    ${data.message || "Failed to load comments."}
                </p>
            `;

            return;
        }


        commentsList.innerHTML = "";


        if (
            !data.comments ||
            data.comments.length === 0
        ) {

            commentsList.innerHTML = `
                <p class="no-comments">
                    No comments yet. Be the first to comment!
                </p>
            `;

            return;
        }


        data.comments.forEach(comment => {

            const commentElement =
                createCommentElement(
                    comment,
                    postId,
                    article
                );

            commentsList.appendChild(
                commentElement
            );

        });


    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );


        commentsList.innerHTML = `
            <p>
                Failed to load comments.
            </p>
        `;

    }

}

function createCommentElement(
    comment,
    postId,
    article
) {

    const div =
        document.createElement("div");


    div.className = "comment";


    const authorName =
        comment.author?.name ||
        "Unknown User";


    const username =
        comment.author?.username ||
        "user";


    const firstLetter =
        authorName.charAt(0).toUpperCase();


    const currentUserId =
        user._id || user.id;


    const commentAuthorId =
        comment.author?._id;


    const isOwner =
        commentAuthorId &&
        commentAuthorId.toString() ===
        currentUserId.toString();


    div.innerHTML = `

        <div class="comment-avatar">
            ${firstLetter}
        </div>


        <div class="comment-body">

            <div class="comment-top">

                <strong>
                    ${escapeHTML(authorName)}
                </strong>

                <span>
                    @${escapeHTML(username)}
                </span>

            </div>


            <p>
                ${escapeHTML(comment.content)}
            </p>


            ${
                isOwner
                ? `
                    <button
                        class="delete-comment-btn"
                    >
                        Delete
                    </button>
                `
                : ""
            }

        </div>

    `;


    // Delete comment
    if (isOwner) {

        const deleteBtn =
            div.querySelector(
                ".delete-comment-btn"
            );


        deleteBtn.addEventListener(
            "click",
            () => {

                deleteComment(
                    comment._id,
                    postId,
                    article
                );

            }
        );

    }


    return div;
}


async function handleCommentSubmit(
    postId,
    article
) {

    const input =
        article.querySelector(
            ".comment-input"
        );


    const button =
        article.querySelector(
            ".comment-submit-btn"
        );


    const content =
        input.value.trim();


    if (!content) {

        alert("Please write a comment.");

        return;
    }


    button.disabled = true;

    button.textContent = "Posting...";


    try {

        const response = await fetch(
            `${API_URL}/posts/${postId}/comments`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    content
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to add comment."
            );

            return;
        }


        // Clear input
        input.value = "";


        // Reload comments
        await loadComments(
            postId,
            article
        );


    } catch (error) {

        console.error(
            "Add comment error:",
            error
        );


        alert(
            "Unable to connect to server."
        );


    } finally {

        button.disabled = false;

        button.textContent = "Post";

    }

}

async function deleteComment(
    commentId,
    postId,
    article
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this comment?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/comments/${commentId}`,
            {
                method: "DELETE",

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
                "Failed to delete comment."
            );

            return;
        }


        // Reload comments
        await loadComments(
            postId,
            article
        );


    } catch (error) {

        console.error(
            "Delete comment error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}




// ===============================
// Edit Post
// ===============================

async function editPost(
    postId,
    article,
    oldContent
) {

    const newContent =
        prompt(
            "Edit your post:",
            oldContent
        );

    if (newContent === null) {
        return;
    }

    const content =
        newContent.trim();

    if (!content) {
        alert("Post cannot be empty.");
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/posts/${postId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        content
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to edit post."
            );

            return;
        }


        const postText =
            article.querySelector(
                ".post-text"
            );

        postText.textContent =
            data.post.content;


    } catch (error) {

        console.error(
            "Edit post error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// ===============================
// Delete Post
// ===============================

async function deletePost(postId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this post?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/posts/${postId}`,
                {
                    method: "DELETE",

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
                "Failed to delete post."
            );

            return;
        }


        alert(
            "Post deleted successfully."
        );


        await loadPosts();


    } catch (error) {

        console.error(
            "Delete post error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =========================
// Format Post Date
// =========================

function formatPostDate(dateString) {

    if (!dateString) {
        return "Just now";
    }


    const date =
        new Date(dateString);


    const now =
        new Date();


    const difference =
        Math.floor(
            (now - date) / 1000
        );


    // Less than 1 minute
    if (difference < 60) {
        return "Just now";
    }


    // Minutes
    if (difference < 3600) {

        const minutes =
            Math.floor(difference / 60);

        return `${minutes}m ago`;
    }


    // Hours
    if (difference < 86400) {

        const hours =
            Math.floor(difference / 3600);

        return `${hours}h ago`;
    }


    // Days
    if (difference < 604800) {

        const days =
            Math.floor(difference / 86400);

        return `${days}d ago`;
    }


    // Older posts
    return date.toLocaleDateString();

}


// =========================
// Escape HTML
// =========================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// =========================
// Load Feed on Page Load
// =========================

loadPosts();