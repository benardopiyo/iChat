const container = document.querySelector(".container");
const header = document.querySelector(".header");
import { welcomePage } from "./pageContext/welcome.js"
import { headerContext } from "./pageContext/header.js"
import { signinContext } from "./pageContext/login.js"
import { signupContext } from "./pageContext/signup.js"
import { homePageContext } from "./pageContext/home.js"
import { loadPosts } from "./loadPosts.js"
import { notify } from "./pageContext/notification.js"

export let ws;

// Check if user is logged in
const isLoggedIn = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("sessionToken");
    return user && token;
};

// Universal logout function that can be called from anywhere
const performLogout = async () => {
    try {
        // Show loading state
        const logoutBtns = document.querySelectorAll('.logout-nav-link, .nav-link-logout .nav-link-out');
        logoutBtns.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.6';
        });

        // Close WebSocket connection if exists
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }

        // Call logout endpoint
        const response = await fetch("/logout", {
            method: "POST",
            credentials: "include"
        });

        // Clear local storage regardless of response
        localStorage.clear();
        
        if (response.ok) {
            notify("Logged out successfully", "#27AE60");
        } else {
            notify("Logout completed", "#27AE60");
        }

        // Redirect to welcome page after a short delay
        setTimeout(() => {
            history.pushState({}, "", "/welcome");
            handleRoutes();
        }, 1000);

    } catch (error) {
        console.error("Logout error:", error);
        // Clear local storage even on error
        localStorage.clear();
        notify("Logged out", "#27AE60");
        
        setTimeout(() => {
            history.pushState({}, "", "/welcome");
            handleRoutes();
        }, 1000);
    }
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
            // Always check authentication for home page
            if (isLoggedIn()) {
                loadAuthenticatedHomePage();
            } else {
                // Redirect non-authenticated users to welcome page
                history.pushState({}, "", "/welcome");
                loadWelcomePage(false);
            }
            break;
        default:
            // For any unknown routes, redirect to appropriate page based on auth status
            if (isLoggedIn()) {
                history.pushState({}, "", "/");
                handleRoutes();
            } else {
                history.pushState({}, "", "/welcome");
                handleRoutes();
            }
            break;
    }
};

// AUTHENTICATED HOME PAGE (Only accessible after login)
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
    // Setup header authenticated elements
    document.querySelector("#user-inbox").innerHTML = `<i class="fas fa-envelope"><span class="newMessage-notification">0</span></i>`;
    document.querySelector(".user-profile-nav-link").innerHTML = `<i class="fa-regular fa-user"></i>`;
    
    // Show logout button in header
    const headerLogoutBtn = document.getElementById("header-logout-btn");
    if (headerLogoutBtn) {
        headerLogoutBtn.style.display = "flex";
        // Add logout event listener
        headerLogoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Optional: Show confirmation dialog
            const confirmLogout = confirm("Are you sure you want to logout?");
            if (confirmLogout) {
                performLogout();
            }
        });
    }

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
    
    // Hide authenticated elements for non-authenticated users
    hideAuthenticatedHeaderElements();
    
    attachWelcomePageListeners();
};

// SIGN IN PAGE
const loadSignIn = (pushState = true) => {
    if (pushState) history.pushState({}, "", "/signin");
    container.className = "container auth-layout";
    header.innerHTML = headerContext;
    container.innerHTML = signinContext;
    
    // Hide authenticated elements
    hideAuthenticatedHeaderElements();
    
    attachAuthListeners();
};

// SIGN UP PAGE
const loadSignUp = (pushState = true) => {
    if (pushState) history.pushState({}, "", "/signups");
    container.className = "container auth-layout";
    header.innerHTML = headerContext;
    container.innerHTML = signupContext;
    
    // Hide authenticated elements
    hideAuthenticatedHeaderElements();
    
    attachAuthListeners();
};

// Hide authenticated elements for non-authenticated users
const hideAuthenticatedHeaderElements = () => {
    const headerLogoutBtn = document.getElementById("header-logout-btn");
    const userInbox = document.getElementById("user-inbox");
    const userProfileLink = document.querySelector(".user-profile-nav-link");

    if (headerLogoutBtn) headerLogoutBtn.style.display = "none";
    if (userInbox) userInbox.style.display = "none";
    if (userProfileLink) userProfileLink.style.display = "none";
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

    // Sort users alphabetically by name (for users without chat messages)
    onlineUsers.sort((a, b) => a.name.localeCompare(b.name));

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
            <button type="button" class="user-button" data-userid="${user.id}" data-username="${user.name}">
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
                    <input type="file" class="image-input" data-receiver="${user.id}" accept="image/*" style="display: none;">
                    <button type="button" class="image-upload-btn" data-receiver="${user.id}"><i class="fas fa-paperclip"></i></button>
                    <button type="button" class="chat-send-btn" data-receiver="${user.id}">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    // Add click handlers for users
    setupUserClickHandlers();

    // Add click handlers for user profile display
    document.querySelectorAll('.user-button').forEach(button => {
        button.addEventListener('click', (e) => {
            // Prevent opening chat form if clicking on the image upload or send button
            if (e.target.closest('.image-upload-btn') || e.target.closest('.chat-send-btn')) {
                return;
            }
            const userId = button.dataset.userid;
            showUserProfileModal(userId);
        });
    });
};

const showUserProfileModal = async (userId) => {
    const profileModal = document.getElementById("profileModal");
    const modalOverlay = document.getElementById("modalOverlay");

    if (!profileModal || !modalOverlay) return;

    try {
        const response = await fetch(`/user-profile?userId=${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user profile");
        }
        const userProfile = await response.json();

        profileModal.innerHTML = `
            <div class="profile-header">
                <h3>${userProfile.username}</h3>
                <button class="close-profile-modal">&times;</button>
            </div>
            <div class="profile-details">
                <p><strong>Name:</strong> ${userProfile.firstname} ${userProfile.lastname}</p>
                <p><strong>Email:</strong> ${userProfile.email}</p>
                <p><strong>Age:</strong> ${userProfile.age}</p>
                <p><strong>Gender:</strong> ${userProfile.gender}</p>
            </div>
        `;

        profileModal.classList.add("active");
        modalOverlay.classList.add("active");

        document.querySelector('.close-profile-modal').addEventListener('click', () => {
            profileModal.classList.remove("active");
            modalOverlay.classList.remove("active");
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                profileModal.classList.remove("active");
                modalOverlay.classList.remove("active");
            }
        });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        notify("Failed to load user profile", "#E74C3C");
    }
};
// };

const setupUserClickHandlers = () => {
    const userButtons = document.querySelectorAll('.user-button');
    const chatSendBtns = document.querySelectorAll('.chat-send-btn');
    const chatInputs = document.querySelectorAll('.chat-input');
    const imageUploadBtns = document.querySelectorAll('.image-upload-btn');
    const imageInputs = document.querySelectorAll('.image-input');

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

    imageUploadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const receiverId = btn.dataset.receiver;
            const imageInput = document.querySelector(`.image-input[data-receiver="${receiverId}"]`);
            imageInput.click();
        });
    });

    imageInputs.forEach(input => {
        input.addEventListener('change', async (e) => {
            const receiverId = e.target.dataset.receiver;
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch('/upload-image', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    if (response.ok) {
                        sendQuickMessage(receiverId, '', data.imageUrl);
                    } else {
                        notify('Image upload failed', '#E74C3C');
                    }
                } catch (error) {
                    console.error('Image upload failed:', error);
                    notify('Image upload failed', '#E74C3C');
                }
            }
        });
    });
};

const sendQuickMessage = async (receiverId, message = '', imageUrl = '') => {
    const input = document.querySelector(`.chat-input[data-receiver="${receiverId}"]`);
    if (message === '') {
        message = input.value.trim();
    }

    if (!message && !imageUrl) return;

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
                image: imageUrl,
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

                if (!isVisible) {
                    // Show all chats instantly when notification button is clicked
                    messageThread.style.display = "flex";

                    // Immediately fetch and display all user messages without loading
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (user) {
                        fetchUserMessages(user.id);
                    }

                    // Hide other chat interfaces
                    if (chatWrapper) {
                        chatWrapper.style.display = "none";
                    }

                    console.log("📬 Showing all chat threads instantly");
                } else {
                    // Hide message thread
                    messageThread.style.display = "none";
                }
            }
        });
    }

    setupMainChatInput(ws);
};

// Setup enhanced chat interface handlers
const setupEnhancedChatHandlers = (ws) => {
    const chatInterface = document.getElementById("chatInterface");
    if (!chatInterface) return;

    // Minimize chat button
    const minimizeBtn = document.getElementById("minimizeChat");
    if (minimizeBtn) {
        minimizeBtn.addEventListener("click", () => {
            chatInterface.style.display = "none";
        });
    }

    // Close chat button
    const closeBtn = document.getElementById("closeChat");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatInterface.style.display = "none";
            // Clear chat messages and reset receiver
            const chatMessages = document.getElementById("chatMessages");
            const receiverIdInput = document.querySelector("#chatInterface .receiverId");
            if (chatMessages) chatMessages.innerHTML = "";
            if (receiverIdInput) receiverIdInput.value = "";
        });
    }

    // Send message button and input
    const sendBtn = document.getElementById("sendMessage");
    const chatInput = document.getElementById("chatInput");

    if (sendBtn && chatInput) {
        const sendMessage = async () => {
            const receiverId = document.querySelector("#chatInterface .receiverId").value;
            const message = chatInput.value.trim();

            if (!message || !receiverId) return;

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
                    chatInput.value = "";

                    // Add message to current chat
                    const chatMessages = document.getElementById("chatMessages");
                    if (chatMessages) {
                        const messageEl = document.createElement("div");
                        messageEl.classList.add("message", "sender");
                        messageEl.innerHTML = `
                            <div class="message-content">
                                <div class="message-meta">You • ${new Date().toLocaleString('en-US', { hour12: false })}</div>
                                <div class="message-text">${message}</div>
                            </div>
                        `;
                        chatMessages.appendChild(messageEl);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }

                    fetchUserMessages(user.id);
                    notify("Message sent!", "#27AE60");
                }
            } catch (error) {
                console.error("Failed to send message:", error);
                notify("Failed to send message", "#E74C3C");
            }
        };

        sendBtn.addEventListener("click", sendMessage);
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
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
    // Logout functionality for user panel (keeping existing functionality)
    const logoutBtn = document.querySelector(".nav-link-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            const confirmLogout = confirm("Are you sure you want to logout?");
            if (confirmLogout) {
                await performLogout();
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

    // Enhanced chat interface handlers
    setupEnhancedChatHandlers(ws);

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

        // Clear and immediately show all chats without loading indicators
        messageThreadDiv.innerHTML = "";

        // Parse and sort messages by latest message timestamp (Discord-style)
        const parsedThreads = [];
        messages.data.forEach((message) => {
            try {
                const parsed = JSON.parse(message);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const latestMessage = parsed[parsed.length - 1];
                    parsedThreads.push({
                        messages: parsed,
                        latestMessage: latestMessage,
                        timestamp: new Date(latestMessage.created).getTime()
                    });
                }
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        });

        // Sort threads by latest message timestamp (most recent first - Discord style)
        parsedThreads.sort((a, b) => b.timestamp - a.timestamp);

        // Create and display all thread elements immediately
        parsedThreads.forEach(({ messages: parsed, latestMessage }) => {
            const thread = document.createElement("div");
            thread.classList.add("thread");

            // Determine the other user in the conversation
            const otherUser = latestMessage.sender === userid ?
                { id: latestMessage.receiver, name: getOtherUserName(parsed, userid) } :
                { id: latestMessage.sender, name: latestMessage.name || "Unknown User" };

            const displayName = latestMessage.sender === userid ?
                `You → ${otherUser.name}` :
                otherUser.name;

            // Format timestamp for display
            const messageTime = formatMessageTime(latestMessage.created);

            thread.innerHTML = `
                <div class="thread-user">${displayName}</div>
                <div class="thread-message">${latestMessage.message}</div>
                <div class="thread-time">${messageTime}</div>
            `;

            // Store other user info for chat opening
            thread.dataset.otherUserId = otherUser.id;
            thread.dataset.otherUserName = otherUser.name;

            thread.addEventListener("click", () => openChatFromThread(parsed, userid, otherUser));
            messageThreadDiv.appendChild(thread);
        });

        console.log(`✅ Displayed ${parsedThreads.length} chat threads instantly`);
    } catch (error) {
        console.error("Fetch error:", error);
        const messageThreadDiv = document.querySelector(".messageThread");
        if (messageThreadDiv) {
            messageThreadDiv.innerHTML = '<div class="no-messages">Failed to load messages</div>';
        }
    }
};

// Helper function to get the other user's name from message history
const getOtherUserName = (messages, currentUserId) => {
    for (const msg of messages) {
        if (msg.sender !== currentUserId && msg.name) {
            return msg.name;
        }
    }
    return "Unknown User";
};

// Helper function to format message time for display (Discord-style)
const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return "Just now";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    } else {
        // For older messages, show the actual date
        return messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
};

// New function to open chat from thread notification - shows all messages instantly
const openChatFromThread = (messages, userid, otherUser) => {
    const messageThread = document.querySelector(".messageThread");
    const chatWrapper = document.querySelector(".chat-wrapper");
    const chatInterface = document.getElementById("chatInterface");

    // Hide message thread
    if (messageThread) {
        messageThread.style.display = "none";
    }

    // Show appropriate chat interface with all messages instantly
    if (chatInterface) {
        // Use the enhanced chat interface - show all messages immediately
        showEnhancedChatInterfaceInstant(messages, userid, otherUser);
    } else if (chatWrapper) {
        // Fallback to header chat wrapper - show all messages immediately
        showHeaderChatInterfaceInstant(messages, userid, otherUser);
    }
};

// Enhanced chat interface - instant version (shows all messages immediately)
const showEnhancedChatInterfaceInstant = (messages, userid, otherUser) => {
    const chatInterface = document.getElementById("chatInterface");
    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const receiverIdInput = document.querySelector("#chatInterface .receiverId");

    if (!chatInterface || !chatMessages) return;

    // Update chat header with other user info
    const chatAvatar = chatInterface.querySelector(".chat-avatar");
    const chatUsername = chatInterface.querySelector(".chat-username");

    if (chatAvatar) {
        chatAvatar.src = `https://ui-avatars.com/api/?name=${otherUser.name}&background=4A90E2&color=fff&size=40`;
        chatAvatar.alt = otherUser.name;
    }

    if (chatUsername) {
        chatUsername.textContent = otherUser.name;
    }

    // Set receiver ID
    if (receiverIdInput) {
        receiverIdInput.value = otherUser.id;
    }

    // Show ALL messages instantly without pagination
    loadMessagesIntoContainer(messages, userid, chatMessages);

    // Clear notification count for this conversation
    clearNotificationCount();

    // Show chat interface
    chatInterface.style.display = "flex";

    // Focus input
    if (chatInput) {
        chatInput.focus();
    }

    console.log(`💬 Opened chat with ${otherUser.name} - showing all ${messages.length} messages instantly`);
};

// Header chat interface - instant version (shows all messages immediately)
const showHeaderChatInterfaceInstant = (messages, userid, otherUser) => {
    const chatWrapper = document.querySelector(".chat-wrapper");
    const chatContainer = document.getElementById("chat");
    const receiverIdInput = document.querySelector(".input-container .receiverId");

    if (!chatWrapper || !chatContainer) return;

    // Set receiver ID
    if (receiverIdInput) {
        receiverIdInput.value = otherUser.id;
    }

    // Show ALL messages instantly without pagination
    loadMessagesIntoContainer(messages, userid, chatContainer);

    // Clear notification count for this conversation
    clearNotificationCount();

    // Show chat wrapper
    chatWrapper.style.display = "flex";

    console.log(`💬 Opened header chat with ${otherUser.name} - showing all ${messages.length} messages instantly`);
};

// Updated loadMessages function for backward compatibility
const loadMessages = (messages, userid) => {
    const chatContainer = document.getElementById("chat");
    if (!chatContainer) return;
    loadMessagesIntoContainer(messages, userid, chatContainer);
};

// Unified function to load messages into any container - instant display with animations
const loadMessagesIntoContainer = (messages, userid, container) => {
    if (!container) return;

    container.innerHTML = "";

    messages.forEach((msg, index) => {
        const messageEl = document.createElement("div");
        messageEl.classList.add("message", msg.sender === userid ? "sender" : "receiver");
        const displayName = msg.sender === userid ? "You" : msg.name || "Unknown User";

        let imageHTML = '';
        if (msg.image) {
            imageHTML = `<img src="${msg.image}" alt="Image" class="message-image">`;
        }

        messageEl.innerHTML = `
            <div class="message-content">
                <div class="message-meta">${displayName} • ${msg.created}</div>
                <div class="message-text">${msg.message}</div>
                ${imageHTML}
            </div>
        `;

        // Add staggered animation delay for smooth appearance
        messageEl.style.animationDelay = `${index * 20}ms`;

        container.appendChild(messageEl);
    });

    // Scroll to bottom after all messages are added
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);

    console.log(`💬 Displayed ${messages.length} messages instantly with animations`);
};

// Clear notification count when opening a chat
const clearNotificationCount = () => {
    const notificationElem = document.querySelector(".newMessage-notification");
    if (notificationElem) {
        notificationElem.textContent = "0";
    }
};

// Queue for handling multiple incoming messages
const incomingMessageQueue = {
    messages: [],
    timer: null,
    batchDelay: 500 // 500ms delay to batch incoming messages
};

const handleIncomingMessage = (messageData, user) => {
    // Add message to queue
    incomingMessageQueue.messages.push({ messageData, user });

    // Clear existing timer
    if (incomingMessageQueue.timer) {
        clearTimeout(incomingMessageQueue.timer);
    }

    // Set new timer to process batch
    incomingMessageQueue.timer = setTimeout(() => {
        processBatchedIncomingMessages();
    }, incomingMessageQueue.batchDelay);
};

const processBatchedIncomingMessages = () => {
    if (incomingMessageQueue.messages.length === 0) return;

    const chatContainer = document.getElementById("chat");
    const enhancedChatContainer = document.getElementById("chatMessages");
    const currentReceiver = document.querySelector(".input-container .receiverId")?.value;
    const enhancedReceiver = document.querySelector("#chatInterface .receiverId")?.value;

    // Group messages by conversation
    const conversationMessages = {};
    let notificationCount = 0;

    incomingMessageQueue.messages.forEach(({ messageData, user }) => {
        const conversationKey = messageData.sender === user.id ?
            `${user.id}-${messageData.receiver}` :
            `${messageData.sender}-${user.id}`;

        if (!conversationMessages[conversationKey]) {
            conversationMessages[conversationKey] = [];
        }
        conversationMessages[conversationKey].push({ messageData, user });

        // Count notifications
        if (messageData.receiver === user.id) {
            notificationCount++;
        }
    });

    // Process each conversation's messages
    Object.values(conversationMessages).forEach(async (messages) => {
        const firstMessage = messages[0];
        const { messageData: firstMsgData, user } = firstMessage;

        // Check if this conversation is currently open
        const isCurrentChat = (chatContainer && (firstMsgData.sender === currentReceiver || firstMsgData.receiver === user.id)) ||
                             (enhancedChatContainer && (firstMsgData.sender === enhancedReceiver || firstMsgData.receiver === user.id));

        if (isCurrentChat) {
            const container = enhancedChatContainer || chatContainer;

            if (messages.length > 5) {
                // Use batch loading for multiple messages
                console.log(`📦 Batch loading ${messages.length} incoming messages`);
                const messageElements = messages.map(({ messageData, user }) => {
                    const messageEl = document.createElement("div");
                    messageEl.classList.add("message", messageData.sender === user.id ? "sender" : "receiver");
                    const senderName = messageData.sender === user.id ? "You" : messageData.name;

                    messageEl.innerHTML = `
                        <div class="message-content">
                            <div class="message-meta">${senderName} • ${messageData.created}</div>
                            <div class="message-text">${messageData.message}</div>
                        </div>
                    `;
                    return messageEl;
                });

                // Add messages in batches with animation
                await addMessagesInBatches(messageElements, container);
            } else {
                // Add messages normally for small batches
                messages.forEach(({ messageData, user }) => {
                    const messageEl = document.createElement("div");
                    messageEl.classList.add("message", messageData.sender === user.id ? "sender" : "receiver");
                    const senderName = messageData.sender === user.id ? "You" : messageData.name;

                    messageEl.innerHTML = `
                        <div class="message-content">
                            <div class="message-meta">${senderName} • ${messageData.created}</div>
                            <div class="message-text">${messageData.message}</div>
                        </div>
                    `;

                    container.appendChild(messageEl);
                });

                container.scrollTop = container.scrollHeight;
            }
        }
    });

    // Update notification count
    if (notificationCount > 0) {
        const notificationElem = document.querySelector(".newMessage-notification");
        if (notificationElem) {
            let count = parseInt(notificationElem.textContent) || 0;
            count += notificationCount;
            notificationElem.textContent = count.toString();
        }
    }

    // Refresh message threads
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        fetchUserMessages(user.id);
    }

    // Clear the queue
    incomingMessageQueue.messages = [];
    incomingMessageQueue.timer = null;
};

// Add messages in batches with smooth animation
const addMessagesInBatches = async (messageElements, container) => {
    const batchSize = 5;
    const delay = 100; // 100ms between batches

    for (let i = 0; i < messageElements.length; i += batchSize) {
        const batch = messageElements.slice(i, i + batchSize);

        batch.forEach((messageEl, index) => {
            setTimeout(() => {
                messageEl.style.opacity = '0';
                messageEl.style.transform = 'translateY(10px)';
                container.appendChild(messageEl);

                // Animate in
                requestAnimationFrame(() => {
                    messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    messageEl.style.opacity = '1';
                    messageEl.style.transform = 'translateY(0)';
                });
            }, index * 50); // 50ms delay between messages in batch
        });

        // Wait before next batch
        if (i + batchSize < messageElements.length) {
            await new Promise(resolve => setTimeout(resolve, delay + (batchSize * 50)));
        }
    }

    // Final scroll to bottom
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
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

    // Only authenticated users can access this function, so always show full interactions
    const actionsHTML = `
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
    `;

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

// Chat pagination state
const chatState = {
    currentUserId: null,
    otherUserId: null,
    offset: 0,
    limit: 10,
    hasMore: true,
    loading: false,
    totalMessages: 0,
    container: null
};

// Throttle function to prevent spam scroll events (300ms)
const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
};

// Load paginated messages from backend
const loadPaginatedMessages = async (user1Id, user2Id, offset = 0, limit = 10) => {
    try {
        const token = localStorage.getItem("sessionToken");
        const url = `/getpaginatedmessages?user1=${user1Id}&user2=${user2Id}&offset=${offset}&limit=${limit}&token=${token}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to load messages`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading messages:', error);
        return null;
    }
};

// Bulk message loading state for handling large message batches
const bulkLoadingState = {
    isLoading: false,
    messageQueue: [],
    currentBatch: 0,
    batchSize: 10,
    loadDelay: 200 // 200ms delay between batches
};

// Initialize chat with pagination (limit to 10 messages initially)
const initializePaginatedChat = async (currentUserId, otherUserId, container) => {
    chatState.currentUserId = currentUserId;
    chatState.otherUserId = otherUserId;
    chatState.offset = 0;
    chatState.hasMore = true;
    chatState.loading = false;
    chatState.container = container;

    // Show initial loading
    container.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i> Loading messages...</div>';

    const data = await loadPaginatedMessages(currentUserId, otherUserId, 0, 10);
    if (!data) {
        container.innerHTML = '<div class="no-messages">Failed to load messages</div>';
        return;
    }

    chatState.offset = data.messages.length;
    chatState.hasMore = data.hasMore;
    chatState.totalMessages = data.total;

    // Clear loading and show content
    container.innerHTML = '';

    if (data.hasMore && data.total > 10) {
        addLoadMoreButton(container);
    }

    // Handle bulk message loading with throttling
    if (data.messages.length > 10) {
        await loadMessagesInBatches(data.messages, currentUserId, container);
    } else {
        // Load normally for small message sets
        data.messages.forEach(msg => {
            const messageEl = createMessageElement(msg, currentUserId);
            container.appendChild(messageEl);
        });
    }

    container.scrollTop = container.scrollHeight;

    // Set up scroll listener for conversations with 20+ messages (with throttling)
    if (data.total >= 20) {
        setupThrottledScrollListener(container);
    } else if (data.total > 10) {
        setupScrollListener(container);
    }
};

// Load messages in batches with throttling (for bulk message scenarios like 32 messages)
const loadMessagesInBatches = async (messages, currentUserId, container) => {
    if (bulkLoadingState.isLoading) return;

    bulkLoadingState.isLoading = true;
    bulkLoadingState.messageQueue = [...messages];
    bulkLoadingState.currentBatch = 0;

    // Show bulk loading indicator
    const bulkLoadingEl = document.createElement('div');
    bulkLoadingEl.className = 'bulk-loading-indicator';
    bulkLoadingEl.innerHTML = `
        <div class="bulk-loading-content">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading messages in batches...</span>
            <div class="batch-progress">
                <span class="batch-current">0</span> / <span class="batch-total">${Math.ceil(messages.length / bulkLoadingState.batchSize)}</span> batches
            </div>
        </div>
    `;
    container.appendChild(bulkLoadingEl);

    const loadNextBatch = async () => {
        const startIndex = bulkLoadingState.currentBatch * bulkLoadingState.batchSize;
        const endIndex = Math.min(startIndex + bulkLoadingState.batchSize, bulkLoadingState.messageQueue.length);
        const batch = bulkLoadingState.messageQueue.slice(startIndex, endIndex);

        // Update progress indicator
        const progressCurrent = bulkLoadingEl.querySelector('.batch-current');
        if (progressCurrent) {
            progressCurrent.textContent = bulkLoadingState.currentBatch + 1;
        }

        // Load batch of messages with smooth animation
        batch.forEach((msg, index) => {
            setTimeout(() => {
                const messageEl = createMessageElement(msg, currentUserId);
                messageEl.style.opacity = '0';
                messageEl.style.transform = 'translateY(10px)';

                // Insert before the loading indicator
                container.insertBefore(messageEl, bulkLoadingEl);

                // Animate in
                requestAnimationFrame(() => {
                    messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    messageEl.style.opacity = '1';
                    messageEl.style.transform = 'translateY(0)';
                });

                // Auto-scroll to bottom for the last message in batch
                if (index === batch.length - 1) {
                    setTimeout(() => {
                        container.scrollTop = container.scrollHeight;
                    }, 100);
                }
            }, index * 50); // 50ms delay between individual messages in batch
        });

        bulkLoadingState.currentBatch++;

        // Check if more batches remain
        if (endIndex < bulkLoadingState.messageQueue.length) {
            // Schedule next batch with throttle delay
            setTimeout(() => {
                loadNextBatch();
            }, bulkLoadingState.loadDelay + (batch.length * 50)); // Wait for current batch animation + delay
        } else {
            // All batches loaded, cleanup
            setTimeout(() => {
                bulkLoadingEl.remove();
                bulkLoadingState.isLoading = false;
                bulkLoadingState.messageQueue = [];
                bulkLoadingState.currentBatch = 0;

                // Final scroll to bottom
                container.scrollTop = container.scrollHeight;

                console.log(`✅ Bulk loading complete: ${messages.length} messages loaded in ${Math.ceil(messages.length / bulkLoadingState.batchSize)} batches`);
            }, 300);
        }
    };

    // Start loading batches
    await loadNextBatch();
};

// Load more messages in batches (for scroll loading scenarios)
const loadMoreMessagesInBatches = async (messages, container, originalScrollHeight) => {
    if (bulkLoadingState.isLoading) return;

    bulkLoadingState.isLoading = true;
    bulkLoadingState.messageQueue = [...messages];
    bulkLoadingState.currentBatch = 0;

    const loadNextBatch = async () => {
        const startIndex = bulkLoadingState.currentBatch * bulkLoadingState.batchSize;
        const endIndex = Math.min(startIndex + bulkLoadingState.batchSize, bulkLoadingState.messageQueue.length);
        const batch = bulkLoadingState.messageQueue.slice(startIndex, endIndex);

        // Load batch of messages with smooth animation
        batch.forEach((msg, index) => {
            setTimeout(() => {
                const messageEl = createMessageElement(msg, chatState.currentUserId);
                messageEl.style.opacity = '0';
                messageEl.style.transform = 'translateY(-10px)';

                // Insert at the top (after load more button if exists)
                const loadMoreBtn = container.querySelector('.load-more-messages');
                if (loadMoreBtn) {
                    container.insertBefore(messageEl, loadMoreBtn.nextSibling);
                } else {
                    container.insertBefore(messageEl, container.firstChild);
                }

                // Animate in
                requestAnimationFrame(() => {
                    messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    messageEl.style.opacity = '1';
                    messageEl.style.transform = 'translateY(0)';
                });
            }, index * 30); // 30ms delay between individual messages in batch
        });

        bulkLoadingState.currentBatch++;

        // Check if more batches remain
        if (endIndex < bulkLoadingState.messageQueue.length) {
            // Schedule next batch with throttle delay
            setTimeout(() => {
                loadNextBatch();
            }, bulkLoadingState.loadDelay + (batch.length * 30)); // Wait for current batch animation + delay
        } else {
            // All batches loaded, cleanup and adjust scroll
            setTimeout(() => {
                bulkLoadingState.isLoading = false;
                bulkLoadingState.messageQueue = [];
                bulkLoadingState.currentBatch = 0;

                // Maintain scroll position
                container.scrollTop = container.scrollHeight - originalScrollHeight;

                console.log(`✅ Bulk load more complete: ${messages.length} messages loaded in ${Math.ceil(messages.length / bulkLoadingState.batchSize)} batches`);
            }, 200);
        }
    };

    // Start loading batches
    await loadNextBatch();
};

// Create message element
const createMessageElement = (msg, currentUserId) => {
    const messageEl = document.createElement("div");
    messageEl.classList.add("message", msg.sender === currentUserId ? "sender" : "receiver");
    const displayName = msg.sender === currentUserId ? "You" : msg.name || "Unknown User";

    messageEl.innerHTML = `
        <div class="message-content">
            <div class="message-meta">${displayName} • ${msg.created}</div>
            <div class="message-text">${msg.message}</div>
        </div>
    `;

    return messageEl;
};

// Add "Load More" button
const addLoadMoreButton = (container) => {
    const loadMoreDiv = document.createElement('div');
    loadMoreDiv.className = 'load-more-messages';
    loadMoreDiv.innerHTML = `
        <button class="load-more-btn" onclick="loadMoreMessages()">
            <i class="fas fa-chevron-up"></i>
            Load more messages
        </button>
    `;
    container.insertBefore(loadMoreDiv, container.firstChild);
};

// Setup scroll listener for conversations with 11-19 messages (no throttling)
const setupScrollListener = (container) => {
    container.addEventListener('scroll', async () => {
        if (container.scrollTop <= 50 && chatState.hasMore && !chatState.loading) {
            await loadMoreMessages();
        }
    });
};

// Setup throttled scroll listener for conversations with 20+ messages
const setupThrottledScrollListener = (container) => {
    const throttledHandler = throttle(async () => {
        if (container.scrollTop <= 50 && chatState.hasMore && !chatState.loading) {
            await loadMoreMessages();
        }
    }, 300); // 300ms throttle to prevent spam

    container.addEventListener('scroll', throttledHandler);
};

// Load more messages (loads exactly 10 more)
const loadMoreMessages = async () => {
    if (chatState.loading || !chatState.hasMore) return;

    chatState.loading = true;
    const container = chatState.container;

    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-more-messages';
    loadingEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading more messages...';
    container.insertBefore(loadingEl, container.firstChild);

    const scrollHeight = container.scrollHeight;

    try {
        const data = await loadPaginatedMessages(chatState.currentUserId, chatState.otherUserId, chatState.offset, 10);
        if (!data) return;

        // Remove loading indicator
        loadingEl.remove();

        chatState.offset += data.messages.length;
        chatState.hasMore = data.hasMore;

        // Handle bulk loading for large message sets (more than 10 messages)
        if (data.messages.length > 10) {
            await loadMoreMessagesInBatches(data.messages.reverse(), container, scrollHeight);
        } else {
            // Load normally for small message sets
            data.messages.reverse().forEach(msg => {
                const messageEl = createMessageElement(msg, chatState.currentUserId);
                const loadMoreBtn = container.querySelector('.load-more-messages');
                if (loadMoreBtn) {
                    container.insertBefore(messageEl, loadMoreBtn.nextSibling);
                } else {
                    container.insertBefore(messageEl, container.firstChild);
                }
            });

            container.scrollTop = container.scrollHeight - scrollHeight;
        }

        if (!data.hasMore) {
            const loadMoreBtn = container.querySelector('.load-more-messages');
            if (loadMoreBtn) loadMoreBtn.remove();
        }

    } catch (error) {
        console.error('Error loading more messages:', error);
        loadingEl.remove();
    } finally {
        chatState.loading = false;
    }
};

// Make loadMoreMessages globally available for button clicks
window.loadMoreMessages = loadMoreMessages;

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

// Make performLogout globally available for debugging
window.performLogout = performLogout;