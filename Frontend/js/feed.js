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


    // =========================
    // Author Information
    // =========================

    const authorName =
        post.author?.name || "Unknown User";

    const username =
        post.author?.username || "user";

    const firstLetter =
        authorName.charAt(0).toUpperCase();


    // =========================
    // Like Information
    // =========================

    const likesCount =
        post.likes?.length || 0;

    const currentUserId =
        user._id || user.id;

    const isLiked =
        post.likes?.some(
            id => id.toString() === currentUserId.toString()
        );


    // =========================
    // Date
    // =========================

    const postDate =
        formatPostDate(post.createdAt);


    // =========================
    // Post HTML
    // =========================

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
                    @${escapeHTML(username)} · ${postDate}
                </p>

            </div>

        </div>


        <div class="post-content">

            <p>
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


        <!-- Comments Section -->

        <div class="comments-section">

            <div class="comment-form">

                <input
                    type="text"
                    class="comment-input"
                    placeholder="Write a comment..."
                    maxlength="500"
                />

                <button class="comment-submit-btn">
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


    // =========================
    // Like Button
    // =========================

    const likeBtn =
        article.querySelector(".like-btn");


    likeBtn.addEventListener("click", () => {

        handleLike(post._id, likeBtn);

    });


    // =========================
    // Comment Button
    // =========================

    const commentBtn =
        article.querySelector(".comment-btn");

    const commentsSection =
        article.querySelector(".comments-section");


    commentBtn.addEventListener("click", () => {

        commentsSection.classList.toggle("show");


        if (
            commentsSection.classList.contains("show")
        ) {

            loadComments(
                post._id,
                article
            );

        }

    });


    // =========================
    // Submit Comment
    // =========================

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


    // Allow Enter to submit
    commentInput.addEventListener(
        "keydown",
        (event) => {

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




async function handleLike(postId, likeBtn) {

    try {

        likeBtn.disabled = true;


        const response = await fetch(
            `${API_URL}/posts/${postId}/like`,
            {
                method: "PUT",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(data.message || "Failed to like post.");

            return;
        }


        // Update like count
        const likeCount =
            likeBtn.querySelector(".like-count");

        if (likeCount) {
            likeCount.textContent =
                data.likesCount;
        }


        // Update button state
        if (data.liked) {

            likeBtn.classList.add("liked");

        } else {

            likeBtn.classList.remove("liked");

        }


    } catch (error) {

        console.error("Like error:", error);

        alert("Unable to connect to server.");

    } finally {

        likeBtn.disabled = false;

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