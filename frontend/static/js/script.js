const container = document.querySelector(".container");
const header = document.querySelector(".header");
import { welcomePage } from "./pageContext/welcome.js"
import { headerContext } from "./pageContext/header.js"
import { signinContext } from "./pageContext/login.js"
import { signupContext } from "./pageContext/signup.js"
import { homePageContext } from "./pageContext/home.js"
import { publicHomePage } from "./pageContext/publicHome.js"
import { loadPosts } from "./loadPosts.js"
import { notify } from "./pageContext/notification.js"

export let ws;

// Check if user is logged in
const isLoggedIn = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("sessionToken");
    return user && token;
};

const handleRoutes = () => {
    const path = window.location.pathname;
    console.log("Current route:", path);

    switch (path) {
        case "/welcome":
            loadWelcomePage(false);
            break;
        case "/signin":
            loadSignIn(false);
            break;
        case "/signups":
            loadSignUp(false);
            break;
        case "/":
            if (isLoggedIn()) {
                loadAuthenticatedHomePage();
            } else {
                loadPublicHomePage();
            }
            break;
        default:
            history.pushState({}, "", "/");
            handleRoutes();
            break;
    }
};

// PUBLIC HOME PAGE
const loadPublicHomePage = () => {
    container.className = "container public-layout";
    header.innerHTML = headerContext;
    container.innerHTML = publicHomePage;

    loadPosts(null, true);

    const loginBtn = document.getElementById("publicLoginBtn");
    const signupBtn = document.getElementById("publicSignupBtn");

    if (loginBtn) loginBtn.addEventListener("click", () => loadSignIn());
    if (signupBtn) signupBtn.addEventListener("click", () => loadSignUp());
};

// AUTHENTICATED HOME PAGE
const loadAuthenticatedHomePage = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    container.className = "container home-layout";
    header.innerHTML = headerContext;
    container.innerHTML = homePageContext;

    // Setup WebSocket
    ws = new WebSocket("ws://localhost:8080/ws");
    ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(JSON.stringify({ type: "user", name: user.username, id: user.id }));
    };

    setupAuthenticatedUI(user);
    loadPosts(ws, false);

    // IMPORTANT: Setup create post modal AFTER DOM is ready
    setTimeout(() => {
        setupCreatePostModal(ws);
    }, 100);

    loadHomePageListeners(ws);
    handleMessages(ws);
    fetchUserMessages(user.id);
    addFooter();
};

const setupAuthenticatedUI = (user) => {
    // Setup header
    document.querySelector("#user-inbox").innerHTML = `<i class="fas fa-envelope"><span class="newMessage-notification">0</span></i>`;
    document.querySelector(".user-profile-nav-link").innerHTML = `<i class="fa-regular fa-user"></i>`;

    // Setup search
    const searchContainer = document.querySelector(".search-wrapper");
    if (searchContainer) {
        searchContainer.innerHTML = `
            <div class="search-input-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" placeholder="Search posts...">
            </div>
        `;
    }

    // Setup user details
    const userNickName = document.getElementById("userNickName");
    const userFullname = document.getElementById("user-fullname");
    const userEmail = document.getElementById("user-email");
    const userAge = document.getElementById("user-age");

    if (userNickName) userNickName.textContent = user.username;
    if (userFullname) userFullname.textContent = `${user.firstname} ${user.lastname}`;
    if (userEmail) userEmail.textContent = user.email;
    if (userAge) userAge.textContent = user.age;
};

// WELCOME PAGE
const loadWelcomePage = (pushState = true) => {
    if (pushState) history.pushState({}, "", "/welcome");
    container.className = "container welcome-layout";
    header.innerHTML = headerContext;
    container.innerHTML = welcomePage;
    attachWelcomePageListeners();
};

// SIGN IN PAGE
const loadSignIn = (pushState = true) => {
    if (pushState) history.pushState({}, "", "/signin");
    container.className = "container auth-layout";
    header.innerHTML = headerContext;
    container.innerHTML = signinContext;
    attachAuthListeners();
};

// SIGN UP PAGE
const loadSignUp = (pushState = true) => {
    if (pushState) history.pushState({}, "", "/signups");
    container.className = "container auth-layout";
    header.innerHTML = headerContext;
    container.innerHTML = signupContext;
    attachAuthListeners();
};

// EVENT LISTENERS
const attachWelcomePageListeners = () => {
    const login = document.getElementById("loginBtn");
    const signUp = document.getElementById("signUpBtn");

    if (login) login.addEventListener("click", () => loadSignIn());
    if (signUp) signUp.addEventListener("click", () => loadSignUp());
};

const attachAuthListeners = () => {
    const signUpBtn = document.getElementById("signUpBtn");
    const loginBtn = document.getElementById("loginBtn");
    const loginForm = document.querySelector("#loginForm");
    const signupForm = document.getElementById("signUpForm");

    if (signUpBtn) signUpBtn.addEventListener("click", () => loadSignUp());
    if (loginBtn) loginBtn.addEventListener("click", () => loadSignIn());
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (signupForm) signupForm.addEventListener("submit", handleSignup);
};

// AUTHENTICATION HANDLERS
const handleLogin = async (e) => {
    e.preventDefault();
    const name = document.querySelector("input[name='email']").value;
    const password = document.querySelector("input[name='password']").value;

    try {
        const response = await fetch("/login", {
            method: 'POST',
            body: JSON.stringify({ name, password }),
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (response.status === 200) {
            localStorage.setItem("sessionToken", data.session_token);
            localStorage.setItem("user", JSON.stringify(data));
            history.pushState({}, "", "/");
            loadAuthenticatedHomePage();
            notify("Welcome back!", "#27AE60");
        } else {
            notify(data.message, "#E74C3C");
        }
    } catch (err) {
        console.error("Login failed:", err);
        notify("Login failed. Please try again.", "#E74C3C");
    }
};

const handleSignup = async (e) => {
    e.preventDefault();
    const username = document.querySelector("input[name='username']").value;
    const firstName = document.querySelector("input[name='firstName']").value;
    const lastName = document.querySelector("input[name='lastName']").value;
    const gender = document.querySelector("select[name='gender']").value;
    const age = parseInt(document.querySelector("input[name='age']").value);
    const email = document.querySelector("input[name='email']").value;
    const password = document.querySelector("input[name='password']").value;

    if (password.length < 8) {
        notify("Password must be at least 8 characters long.", "#E74C3C");
        return;
    }

    try {
        const res = await fetch("/signup", {
            method: "POST",
            body: JSON.stringify({
                Username: username,
                FirstName: firstName,
                LastName: lastName,
                Age: age,
                Gender: gender,
                Email: email,
                Password: password
            }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (res.status === 201) {
            notify("Account created successfully!", "#27AE60");
            loadSignIn();
        } else {
            notify(data.message, "#E74C3C");
        }
    } catch (error) {
        console.log("SignUp Failed", error);
        notify("Signup failed. Please try again.", "#E74C3C");
    }
};

// FIXED CREATE POST MODAL - WITH PROPER FORM RESET
const setupCreatePostModal = (ws) => {
    console.log("Setting up create post modal...");
    
    let currentForm = null; // Keep track of the current form
    
    // Wait for DOM to be ready
    const initModal = () => {
        // Get elements
        const showPostBtn = document.getElementById("showPostDiv");
        const quickCreateBtn = document.getElementById("quickCreatePost");
        const headerCreateBtn = document.querySelector(".create-post-btn");
        const modal = document.querySelector(".create-post");
        const overlay = document.getElementById("modalOverlay");
        const closeBtn = document.getElementById("closePostModal");
        const cancelBtn = document.getElementById("cancelPost");
        const form = document.getElementById("createPostForm");
        
        console.log("Found elements:", {
            showPostBtn: !!showPostBtn,
            quickCreateBtn: !!quickCreateBtn,
            headerCreateBtn: !!headerCreateBtn,
            modal: !!modal,
            overlay: !!overlay,
            closeBtn: !!closeBtn,
            cancelBtn: !!cancelBtn,
            form: !!form
        });
        
        // Function to reset form properly
        const resetForm = () => {
            const currentFormRef = document.getElementById("createPostForm");
            if (currentFormRef) {
                // Reset all input fields
                const inputs = currentFormRef.querySelectorAll("input[type='text'], textarea");
                inputs.forEach(input => {
                    input.value = "";
                });
                
                // Reset all checkboxes
                const checkboxes = currentFormRef.querySelectorAll("input[type='checkbox']");
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Reset submit button state
                const submitBtn = currentFormRef.querySelector("button[type='submit']");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Post';
                }
                
                console.log("Form reset completed");
            }
        };
        
        // Show modal function
        const showModal = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log("Opening modal");
            if (modal && overlay) {
                modal.classList.add("active");
                overlay.classList.add("active");
                document.body.style.overflow = "hidden";
                
                // Reset form every time modal opens
                resetForm();
                
                // Focus title input
                setTimeout(() => {
                    const titleInput = modal.querySelector("input[name='title']");
                    if (titleInput) titleInput.focus();
                }, 100);
            }
        };
        
        // Hide modal function
        const hideModal = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log("Closing modal");
            if (modal && overlay) {
                modal.classList.remove("active");
                overlay.classList.remove("active");
                document.body.style.overflow = "";
                
                // Reset form when closing
                resetForm();
            }
        };
        
        // Remove any existing event listeners by cloning elements
        const cloneAndReplace = (element) => {
            if (element && element.parentNode) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                return newElement;
            }
            return element;
        };
        
        // Clone buttons to remove existing listeners
        const newShowPostBtn = cloneAndReplace(showPostBtn);
        const newQuickCreateBtn = cloneAndReplace(quickCreateBtn);
        const newHeaderCreateBtn = cloneAndReplace(headerCreateBtn);
        const newCloseBtn = cloneAndReplace(closeBtn);
        const newCancelBtn = cloneAndReplace(cancelBtn);
        const newOverlay = cloneAndReplace(overlay);
        const newForm = cloneAndReplace(form);
        
        // Update current form reference
        currentForm = newForm;
        
        // Add click handlers to open modal
        if (newShowPostBtn) {
            newShowPostBtn.addEventListener("click", showModal);
        }
        if (newQuickCreateBtn) {
            newQuickCreateBtn.addEventListener("click", showModal);
        }
        if (newHeaderCreateBtn) {
            newHeaderCreateBtn.addEventListener("click", showModal);
        }
        
        // Add click handlers to close modal
        if (newCloseBtn) {
            newCloseBtn.addEventListener("click", hideModal);
        }
        if (newCancelBtn) {
            newCancelBtn.addEventListener("click", hideModal);
        }
        
        // Close when clicking overlay (but not modal content)
        if (newOverlay) {
            newOverlay.addEventListener("click", (e) => {
                // Only close if clicking directly on overlay, not its children
                if (e.target === newOverlay) {
                    hideModal(e);
                }
            });
        }
        
        // Prevent modal from closing when clicking inside modal content
        if (modal) {
            modal.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }
        
        // Handle form submission
        if (newForm) {
            newForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Form submitted");
                
                const formData = new FormData(newForm);
                const title = formData.get("title")?.trim();
                const content = formData.get("content")?.trim();
                
                // Get checked categories
                const checkboxes = newForm.querySelectorAll("input[type='checkbox']:checked");
                const categories = Array.from(checkboxes).map(cb => cb.value).join(" ");
                
                if (!title || !content) {
                    alert("Please fill in both title and content");
                    return;
                }
                
                console.log("Submitting:", { title, content, categories });
                
                // Disable submit button to prevent double submission
                const submitBtn = newForm.querySelector("button[type='submit']");
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Creating...";
                }
                
                try {
                    const response = await fetch("/createPost", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title,
                            content,
                            categories,
                            identity: "post"
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        console.log("Post created successfully");
                        
                        // Send via websocket if available
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            const user = JSON.parse(localStorage.getItem("user"));
                            ws.send(JSON.stringify({
                                type: "new_post",
                                id: data.postId,
                                name: user.username,
                                title,
                                content,
                                categories,
                                timestamp: new Date().toISOString()
                            }));
                        }
                        
                        // Close modal and reset form
                        hideModal();
                        alert("Post created successfully!");
                        
                        // Optionally reload posts
                        if (typeof loadPosts === 'function') {
                            loadPosts(ws, false);
                        }
                    } else {
                        console.error("Failed to create post:", data);
                        alert(data.message || "Failed to create post");
                    }
                } catch (error) {
                    console.error("Error creating post:", error);
                    alert("An error occurred. Please try again.");
                } finally {
                    // Re-enable submit button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Post';
                    }
                }
            });
        }
        
        // Handle escape key to close modal
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal && modal.classList.contains("active")) {
                hideModal();
            }
        });
        
        // Make functions global for debugging
        window.showCreatePostModal = showModal;
        window.hideCreatePostModal = hideModal;
        window.resetCreatePostForm = resetForm;
        
        console.log("Modal setup complete");
    };
    
    // Run initialization
    initModal();
};

// USER LIST MANAGEMENT
const updateUserList = (msg, userData) => {
    const userListContainer = document.getElementById("userList");
    const onlineCount = document.getElementById("onlineCount");

    if (!userListContainer) return;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const onlineUsers = msg.data.filter(u => u.id !== userData.id);

    // Update online count
    if (onlineCount) {
        onlineCount.textContent = onlineUsers.length;
    }

    if (onlineUsers.length === 0) {
        userListContainer.innerHTML = `
            <div class="no-users">
                <i class="fas fa-user-slash"></i>
                <span>No other users online</span>
            </div>
        `;
        return;
    }

    userListContainer.innerHTML = onlineUsers.map(user => `
        <div class="user-item">
            <button type="button" class="user-button" data-userid="${user.id}">
                <img src="https://ui-avatars.com/api/?name=${user.name}&background=4A90E2&color=fff&size=72" 
                     alt="${user.name}" class="user-avatar-small">
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-status">
                        <div class="status-indicator"></div>
                        Online
                    </div>
                </div>
            </button>
            <div class="chat-form" id="chatForm_${user.id}">
                <div class="chat-form-content">
                    <input type="text" placeholder="Type a message..." class="chat-input" data-receiver="${user.id}">
                    <button type="button" class="chat-send-btn" data-receiver="${user.id}">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    // Add click handlers for users
    setupUserClickHandlers();
};

const setupUserClickHandlers = () => {
    const userButtons = document.querySelectorAll('.user-button');
    const chatSendBtns = document.querySelectorAll('.chat-send-btn');
    const chatInputs = document.querySelectorAll('.chat-input');

    userButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.dataset.userid;
            const chatForm = document.getElementById(`chatForm_${userId}`);
            const isActive = chatForm.classList.contains('active');

            // Close all other chat forms
            document.querySelectorAll('.chat-form').forEach(form => {
                form.classList.remove('active');
            });

            // Toggle current form
            if (!isActive) {
                chatForm.classList.add('active');
                chatForm.querySelector('.chat-input').focus();
            }
        });
    });

    chatSendBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sendQuickMessage(btn.dataset.receiver);
        });
    });

    chatInputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendQuickMessage(input.dataset.receiver);
            }
        });
    });
};

const sendQuickMessage = async (receiverId) => {
    const input = document.querySelector(`.chat-input[data-receiver="${receiverId}"]`);
    const message = input.value.trim();

    if (!message) return;

    const user = JSON.parse(localStorage.getItem("user"));

    try {
        const response = await fetch("/privateMessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                receiver: receiverId,
                sender: user.id,
                name: user.username,
                seen: false,
                created: new Date().toLocaleString('en-US', { hour12: false })
            })
        });

        const resBody = await response.json();
        if (response.status === 200) {
            ws.send(JSON.stringify({ "type": "message", "data": resBody.data }));
            input.value = "";

            // Close the chat form
            const chatForm = document.getElementById(`chatForm_${receiverId}`);
            chatForm.classList.remove('active');

            notify("Message sent!", "#27AE60");
            fetchUserMessages(user.id);
        }
    } catch (error) {
        console.error("Failed to send message:", error);
        notify("Failed to send message", "#E74C3C");
    }
};

// MESSAGING SYSTEM
const handleMessages = (ws) => {
    setupChatInterface(ws);
};

const setupChatInterface = (ws) => {
    const inbox = document.querySelector("#user-inbox");
    const messageThread = document.querySelector(".messageThread");
    const chatWrapper = document.querySelector(".chat-wrapper");

    if (chatWrapper) chatWrapper.style.display = "none";
    if (messageThread) messageThread.style.display = "none";

    if (inbox) {
        inbox.addEventListener('click', (e) => {
            e.stopPropagation();
            if (messageThread) {
                const isVisible = messageThread.style.display === "flex";
                messageThread.style.display = isVisible ? "none" : "flex";
                if (!isVisible && chatWrapper) {
                    chatWrapper.style.display = "none";
                }
            }
        });
    }

    setupMainChatInput(ws);
};

const setupMainChatInput = (ws) => {
    const sendBtn = document.querySelector(".input-container #sendBtn");
    const messageInput = document.querySelector(".input-container #messageInput");

    if (sendBtn && messageInput) {
        const sendMessage = async () => {
            const receiverId = document.querySelector(".input-container .receiverId").value;
            const message = messageInput.value.trim();

            if (!message || !receiverId) return;

            const user = JSON.parse(localStorage.getItem("user"));

            const response = await fetch("/privateMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message,
                    receiver: receiverId,
                    sender: user.id,
                    name: user.username,
                    seen: false,
                    created: new Date().toLocaleString('en-US', { hour12: false })
                })
            });

            const resBody = await response.json();
            if (response.status === 200) {
                ws.send(JSON.stringify({ "type": "message", "data": resBody.data }));
                messageInput.value = "";
                fetchUserMessages(user.id);
            }
        };

        sendBtn.addEventListener("click", sendMessage);
        messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
};

// WEBSOCKET HANDLERS
const handleWS = (ws, userData) => {
    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            const user = JSON.parse(localStorage.getItem("user"));

            switch (msg.type) {
                case "user_list":
                    updateUserList(msg, userData);
                    break;
                case "new_post":
                    appendNewPost(msg.data);
                    notify("New post added!", "#27AE60");
                    break;
                case "reaction":
                    updatePostReactions(msg.data);
                    break;
                case "comment":
                    addNewComment(msg.data);
                    break;
                case "message":
                    handleIncomingMessage(msg.data, user);
                    break;
                case "typing":
                    showTypingIndicator(msg);
                    break;
                case "stoptyping":
                    hideTypingIndicator(msg);
                    break;
            }
        } catch (err) {
            console.error("Error parsing WebSocket message:", err);
        }
    };
};

// HOME PAGE EVENT LISTENERS
const loadHomePageListeners = (ws) => {
    // Logout functionality
    const logoutBtn = document.querySelector(".nav-link-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await fetch("/logout");
                localStorage.clear();
                history.pushState({}, "", "/");
                loadPublicHomePage();
                notify("Logged out successfully", "#27AE60");
            } catch (error) {
                console.error("Logout error:", error);
                localStorage.clear();
                loadPublicHomePage();
            }
        });
    }

    // User profile panel
    const profileBtn = document.querySelector(".user-profile-nav-link");
    const userPanel = document.querySelector(".userPanel");
    const quickProfileBtn = document.getElementById("quickProfile");

    if (profileBtn && userPanel) {
        userPanel.style.display = "none";

        const toggleProfile = (e) => {
            e.stopPropagation();
            userPanel.style.display = userPanel.style.display === "none" ? "block" : "none";
        };

        profileBtn.addEventListener("click", toggleProfile);
        if (quickProfileBtn) quickProfileBtn.addEventListener("click", toggleProfile);
    }

    // Comment functionality
    setupCommentHandlers(ws);

    // Category filtering
    setupCategoryFiltering();

    // Global click handlers
    document.addEventListener("click", (e) => {
        if (userPanel && !userPanel.contains(e.target) &&
            !profileBtn?.contains(e.target) &&
            (!quickProfileBtn || !quickProfileBtn.contains(e.target))) {
            userPanel.style.display = "none";
        }
    });

    // Setup WebSocket handlers
    handleWS(ws, JSON.parse(localStorage.getItem("user")));
};

const setupCommentHandlers = (ws) => {
    document.addEventListener('click', (e) => {
        const commentBtn = e.target.closest('.comment-btn');
        if (commentBtn) {
            e.preventDefault();
            const post = commentBtn.closest('.post');
            const commentsSection = post.querySelector('.comments-section');

            if (commentsSection.classList.contains('open')) {
                commentsSection.style.maxHeight = '0px';
                commentsSection.style.opacity = '0';
                commentsSection.classList.remove('open');
            } else {
                commentsSection.style.maxHeight = commentsSection.scrollHeight + 'px';
                commentsSection.style.opacity = '1';
                commentsSection.classList.add('open');
            }
        }
    });

    document.addEventListener('submit', async (e) => {
        if (e.target.classList.contains('addCommentForm')) {
            e.preventDefault();
            const comment = e.target.querySelector("input[name='comment']").value.trim();
            const postId = e.target.querySelector("input[name='postId']").value;

            if (comment) {
                await createComment(ws, comment, postId);
                e.target.querySelector("input[name='comment']").value = "";
            }
        }
    });
};

const setupCategoryFiltering = () => {
    const categoryItems = document.querySelectorAll('.category-item');

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;

            // Update active state
            categoryItems.forEach(cat => cat.classList.remove('active'));
            item.classList.add('active');

            // Filter posts
            filterPostsByCategory(category);
        });
    });
};

const filterPostsByCategory = (category) => {
    const posts = document.querySelectorAll('.post');

    posts.forEach(post => {
        const postCategory = post.querySelector('.post-category');
        if (category === 'all' || !postCategory) {
            post.style.display = 'block';
        } else {
            const categoryText = postCategory.textContent.toLowerCase();
            if (categoryText.includes(category.toLowerCase())) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        }
    });
};

// UTILITY FUNCTIONS
const createComment = async (ws, comment, postId) => {
    try {
        const res = await fetch("/createComment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment, identity: "comment", postId }),
        });
        const resBody = await res.json();

        if (res.status === 201) {
            const user = JSON.parse(localStorage.getItem("user"));
            const newComment = {
                type: "comment",
                commentId: resBody.commentId,
                name: user.username,
                postId: resBody.postId,
                context: resBody.comment,
                timestamp: resBody.time,
                comments_count: resBody.comments_count,
            };

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(newComment));
            }
        }
    } catch (error) {
        console.log("Unable to send comment:", error);
    }
};

const fetchUserMessages = async (userid) => {
    try {
        const res = await fetch(`/getusermessages?userId=${userid}`);
        const messages = await res.json();
        const messageThreadDiv = document.querySelector(".messageThread");

        if (!messageThreadDiv) return;

        if (!messages.data || !Array.isArray(messages.data)) {
            messageThreadDiv.innerHTML = '<div class="no-messages">No messages yet</div>';
            return;
        }

        messageThreadDiv.innerHTML = "";
        messages.data.forEach((message) => {
            try {
                const parsed = JSON.parse(message);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const latestMessage = parsed[parsed.length - 1];
                    const thread = document.createElement("div");
                    thread.classList.add("thread");
                    const senderName = latestMessage.sender === userid ? "You" : latestMessage.name || "Unknown User";
                    thread.innerHTML = `
                        <div class="thread-user">${senderName}</div>
                        <div class="thread-message">${latestMessage.message}</div>
                        <div class="thread-time">${latestMessage.created}</div>
                    `;
                    thread.addEventListener("click", () => loadMessages(parsed, userid));
                    messageThreadDiv.appendChild(thread);
                }
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        });
    } catch (error) {
        console.error("Fetch error:", error);
    }
};

const loadMessages = (messages, userid) => {
    const chatContainer = document.getElementById("chat");
    const receiverIdInput = document.querySelector(".input-container .receiverId");

    if (!chatContainer) return;

    chatContainer.innerHTML = "";

    messages.forEach(msg => {
        const messageEl = document.createElement("div");
        messageEl.classList.add("message", msg.sender === userid ? "sender" : "receiver");
        const displayName = msg.sender === userid ? "You" : msg.name || "Unknown User";

        messageEl.innerHTML = `
            <div class="message-content">
                <div class="message-meta">${displayName} • ${msg.created}</div>
                <div class="message-text">${msg.message}</div>
            </div>
        `;

        chatContainer.appendChild(messageEl);

        if (receiverIdInput) {
            if (msg.sender !== userid) {
                receiverIdInput.value = msg.sender;
            } else {
                receiverIdInput.value = msg.receiver;
            }
        }
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
};

const handleIncomingMessage = (messageData, user) => {
    const chatContainer = document.getElementById("chat");
    const currentReceiver = document.querySelector(".input-container .receiverId")?.value;

    if (chatContainer && (messageData.sender === currentReceiver || messageData.receiver === user.id)) {
        const messageEl = document.createElement("div");
        messageEl.classList.add("message", messageData.sender === user.id ? "sender" : "receiver");
        const senderName = messageData.sender === user.id ? "You" : messageData.name;

        messageEl.innerHTML = `
            <div class="message-content">
                <div class="message-meta">${senderName} • ${messageData.created}</div>
                <div class="message-text">${messageData.message}</div>
            </div>
        `;

        chatContainer.appendChild(messageEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (messageData.receiver === user.id) {
        const notificationElem = document.querySelector(".newMessage-notification");
        if (notificationElem) {
            let count = parseInt(notificationElem.textContent) || 0;
            count++;
            notificationElem.textContent = count.toString();
        }
    }

    fetchUserMessages(user.id);
};

const updatePostReactions = (reactionData) => {
    const postId = reactionData.data.id;
    const likesElement = document.querySelector(`[postid="${postId}"] #likes-count`);
    const dislikesElement = document.querySelector(`[postid="${postId}"] #dislike-count`);

    if (likesElement && reactionData.data.Likes >= 0) {
        likesElement.textContent = reactionData.data.Likes;
    }
    if (dislikesElement && reactionData.data.Dislikes >= 0) {
        dislikesElement.textContent = reactionData.data.Dislikes;
    }
};

const appendNewPost = (postData) => {
    const postsContainer = document.querySelector(".posts-section");
    if (!postsContainer) return;

    const postElement = document.createElement("div");
    postElement.classList.add("post");
    postElement.setAttribute("postid", postData.id);

    const isLoggedIn = !!localStorage.getItem("user");
    const actionsHTML = isLoggedIn ? `
        <div class="post-actions">
            <form id="postLikesForm">
                <input type="hidden" name="postid" value="${postData.id}">
                <input type="hidden" name="reaction" value="like">
                <button type="submit" class="like-btn">
                    <i class="fas fa-thumbs-up"></i>
                    <span id="likes-count">0</span>
                </button>
            </form>
            <form id="postDislikeBtn">
                <input type="hidden" name="postid" value="${postData.id}">
                <input type="hidden" name="reaction" value="dislike">
                <button type="submit" class="like-btn">
                    <i class="fas fa-thumbs-down"></i>
                    <span id="dislike-count">0</span>
                </button>
            </form>
            <button class="comment-btn">
                <i class="fas fa-comment"></i>
                <span>0</span>
            </button>
        </div>
        <div class="comments-section">
            <div class="add-comment">
                <div class="avatar">
                    <i class="fa-regular fa-user"></i>
                </div>
                <form class="addCommentForm">
                    <input type="hidden" name="identity" value="comment">
                    <input type="hidden" name="postId" value="${postData.id}">
                    <input type="text" placeholder="Write a comment..." name="comment" required>
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
    ` : '<div class="post-actions-disabled">Login to interact with posts</div>';

    postElement.innerHTML = `
        <div class="post-header">
            <div class="avatar">
                <i class="fa-regular fa-user"></i>
            </div>
            <div class="post-info">
                <h4>${postData.name}</h4>
                <span class="post-time">${new Date(postData.timestamp).toLocaleString()}</span>
                <span class="post-category">${postData.categories}</span>
            </div>
        </div>
        <div class="post-content">
            <h6>${postData.title}</h6>
            <p>${postData.content}</p>
        </div>
        ${actionsHTML}
    `;

    postsContainer.prepend(postElement);
};

const addNewComment = (commentData) => {
    const commentsContainer = document.querySelector(`[postid="${commentData.postId}"] .comments-section`);
    const commentBtn = document.querySelector(`[postid="${commentData.postId}"] .comment-btn span`);

    if (commentsContainer) {
        const commentElement = document.createElement("div");
        commentElement.classList.add("comment");
        commentElement.innerHTML = `
            <div class="avatar">
                <i class="fa-regular fa-user"></i>
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <h4>${commentData.name}</h4>
                    <span class="comment-time">${commentData.timestamp}</span>
                </div>
                <p class="comment-text">${commentData.context.comment}</p>
            </div>
        `;

        commentsContainer.insertBefore(commentElement, commentsContainer.lastElementChild);
    }

    if (commentBtn) {
        commentBtn.textContent = commentData.comments_count;
    }
};

const showTypingIndicator = (msg) => {
    const userElement = document.querySelector(`[data-userid="${msg.senderid}"]`);
    if (userElement) {
        const userInfo = userElement.querySelector('.user-name');
        if (userInfo) {
            userInfo.textContent = `${msg.sendername} is typing...`;
            userInfo.style.color = "#27AE60";
            userInfo.classList.add('typing');
        }
    }
};

const hideTypingIndicator = (msg) => {
    const userElement = document.querySelector(`[data-userid="${msg.senderid}"]`);
    if (userElement) {
        const userInfo = userElement.querySelector('.user-name');
        if (userInfo) {
            userInfo.textContent = msg.sendername;
            userInfo.style.color = "";
            userInfo.classList.remove('typing');
        }
    }
};

const addFooter = () => {
    const existingFooter = document.querySelector("footer");
    if (existingFooter) existingFooter.remove();

    const footer = document.createElement("footer");
    footer.innerHTML = "&copy; 2025 RealForum - Connect, Share, Engage";
    document.body.appendChild(footer);
};

// Initialize the application
document.addEventListener("DOMContentLoaded", handleRoutes);
window.addEventListener("popstate", handleRoutes);