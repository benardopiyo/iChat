import { notify } from "./pageContext/notification.js";

export let posts;

export const loadPosts = async (ws, isReadOnly = false) => {
    const token = localStorage.getItem("sessionToken");
    
    try {
        let postsRes;
        if (isReadOnly) {
            // Public endpoint for non-authenticated users
            postsRes = await fetch('/home');
        } else {
            // Authenticated endpoint
            postsRes = await fetch(`/home?token=${token}`);
        }
        
        const postData = await postsRes.json();
        posts = postData.posts;
        
        if (!postsRes.ok && !isReadOnly) {
            notify(postData.message, "#E74C3C");
            setTimeout(() => {
                localStorage.clear();
                window.location.href = "/";
            }, 3000);
            return;
        }
        
        const postsContainer = document.querySelector(".posts-section");
        if (!postsContainer) return;
        
        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-comments"></i>
                    <h3>No posts yet</h3>
                    <p>${isReadOnly ? 'Be the first to join and create a post!' : 'Be the first to create a post!'}</p>
                </div>
            `;
            return;
        }
        
        let pageData = "";
        posts.forEach((post) => {
            const commentsSection = Array.isArray(post.comments)
                ? post.comments.map(comment => `
                    <div class="comment">
                        <div class="avatar">
                            <i class="fa-regular fa-user"></i>
                        </div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <h4>${comment.user_name}</h4>
                                <span class="comment-time">${comment.created_at}</span>
                            </div>
                            <p class="comment-text">${escapeHTML(comment.content)}</p>
                        </div>
                    </div>
                `).join("")
                : "";
            
            // Different UI for authenticated vs public users
            const postActions = isReadOnly 
                ? `<div class="post-actions-disabled">
                     <span class="login-prompt">
                         <i class="fas fa-lock"></i>
                         Login to like, comment, and interact
                     </span>
                   </div>`
                : `<div class="post-actions">
                     <form id="postLikesForm">
                         <input type="hidden" name="postid" value="${post.id}">
                         <input type="hidden" name="reaction" value="like">
                         <button type="submit" class="like-btn">
                             <i class="fas fa-thumbs-up"></i>
                             <span id="likes-count">${post.likes}</span>
                         </button>
                     </form>
                     <form id="postDislikeBtn">
                         <input type="hidden" name="postid" value="${post.id}">
                         <input type="hidden" name="reaction" value="dislike">
                         <button type="submit" class="like-btn">
                             <i class="fas fa-thumbs-down"></i>
                             <span id="dislike-count">${post.dislikes}</span>
                         </button>
                     </form>
                     <button class="comment-btn">
                         <i class="fas fa-comment"></i>
                         <span>${post.comments_num}</span>
                     </button>
                   </div>`;
            
            const commentsUI = isReadOnly
                ? `<div class="comments-section-readonly">
                     ${commentsSection}
                     <div class="comment-login-prompt">
                         <i class="fas fa-sign-in-alt"></i>
                         <span>Login to join the conversation</span>
                     </div>
                   </div>`
                : `<div class="comments-section">
                     ${commentsSection}
                     <div class="add-comment">
                         <div class="avatar">
                             <i class="fa-regular fa-user"></i>
                         </div>
                         <form class="addCommentForm">
                             <input type="hidden" name="identity" value="comment">
                             <input type="hidden" name="postId" value="${post.id}">
                             <input type="text" placeholder="Write a comment..." name="comment" required>
                             <button type="submit"><i class="fas fa-paper-plane"></i></button>
                         </form>
                     </div>
                   </div>`;
            
            pageData += `
                <div class="post" postid="${post.id}">
                    <div class="post-header">
                        <div class="avatar">
                            <i class="fa-regular fa-user"></i>
                        </div>
                        <div class="post-info">
                            <h4>${post.name}</h4>
                            <span class="post-time">${post.created_at}</span>
                            <span class="post-category">
                                <span style="font-weight:bold;">Categories:</span> ${post.category}
                            </span>
                        </div>
                    </div>
                    <div class="post-content">
                        <h6>${post.title}</h6>
                        <p>${post.content}</p>
                    </div>
                    ${postActions}
                    ${commentsUI}
                </div>
            `;
        });
        
        postsContainer.innerHTML = pageData;
        
        // Only add interactive functionality for authenticated users
        if (!isReadOnly) {
            setupPostInteractions(ws);
        } else {
            setupPublicPostBehavior();
        }
        
    } catch (error) {
        console.error("Error loading posts:", error);
        const postsContainer = document.querySelector(".posts-section");
        if (postsContainer) {
            postsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load posts</h3>
                    <p>Please try refreshing the page</p>
                </div>
            `;
        }
    }
};

const setupPostInteractions = (ws) => {
    const postsSection = document.querySelector(".posts-section");
    if (!postsSection) return;
    
    // Clone to remove existing listeners
    const newPostsSection = postsSection.cloneNode(true);
    postsSection.parentNode.replaceChild(newPostsSection, postsSection);
    
    // Add event listeners for likes, dislikes, and comments
    newPostsSection.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        
        // Handle post likes and dislikes
        if (form.matches("#postLikesForm, #postDislikeBtn")) {
            const id = form.querySelector("input[name='postid']").value;
            const reaction = form.querySelector("input[name='reaction']").value;
            const endpoint = reaction === "like" ? "/likePost" : "/dislikePost";
            
            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, reaction }),
                });
                
                if (res.ok) {
                    const resBody = await res.json();
                    const reactions = {
                        type: "reaction",
                        data: { ...resBody, id, reaction },
                    };
                    
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(reactions));
                    }
                } else {
                    console.error(`Failed to ${reaction} post`, res.status);
                }
            } catch (error) {
                console.error(`Error on ${reaction}:`, error);
            }
        }
    });
};

const setupPublicPostBehavior = () => {
    // Add click handlers for public users to prompt login
    const postsSection = document.querySelector(".posts-section");
    if (!postsSection) return;
    
    postsSection.addEventListener("click", (e) => {
        if (e.target.closest(".post-actions-disabled, .comment-login-prompt")) {
            notify("Please login to interact with posts", "#4A90E2");
            setTimeout(() => {
                window.location.href = "/signin";
            }, 2000);
        }
    });
};

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}