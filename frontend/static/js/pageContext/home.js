const userData = JSON.parse(localStorage.getItem("user"));
let name = userData ? userData.username : null;

export const homePageContext = `
    <!-- Left Sidebar - Chat & User Management -->
    <div class="left-sidebar">
        <!-- User Profile Section -->
        <div class="profile-section">
            <div class="profile-header">
                <img src="https://ui-avatars.com/api/?name=${name}&background=4A90E2&color=fff&size=80" alt="Avatar" class="profile-avatar">
                <div class="profile-info">
                    <h3 id="userNickName"></h3>
                    <span class="online-status">
                        <i class="fas fa-circle"></i>
                        Online
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
            <button id="quickCreatePost" class="quick-action-btn">
                <i class="fas fa-plus"></i>
                <span>Post</span>
            </button>
            <button id="quickProfile" class="quick-action-btn">
                <i class="fas fa-user"></i>
                <span>Profile</span>
            </button>
        </div>
        
        <!-- Online Users Section -->
        <div class="online-users-section">
            <div class="section-header">
                <h4>
                    <i class="fas fa-users"></i>
                    Online Users
                </h4>
                <span class="user-count" id="onlineCount">0</span>
            </div>
            <div class="users-container" id="userList"></div>
        </div>
        
        <!-- Recent Chats Section -->
        <div class="recent-chats-section">
            <div class="section-header">
                <h4>
                    <i class="fas fa-comments"></i>
                    Recent Chats
                </h4>
            </div>
            <div class="chats-container" id="recentChats">
                <div class="no-chats">
                    <i class="fas fa-comment-slash"></i>
                    <span>No recent chats</span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="main-content">
        <!-- Content Header -->
        <div class="content-header">
            <div class="header-left">
                <h2>Community Feed</h2>
                <p>Share your thoughts and connect with others</p>
            </div>
            <div class="header-right">
                <button id="showPostDiv" class="create-post-btn">
                    <i class="fas fa-edit"></i>
                    New Post
                </button>
            </div>
        </div>
        
        <!-- Posts Feed -->
        <div class="posts-section"></div>
    </div>
    
    <!-- Right Sidebar - Categories & Stats -->
    <div class="right-sidebar">
        <!-- Categories -->
        <div class="categories-widget">
            <h4>Categories</h4>
            <div class="category-list">
                <div class="category-item active" data-category="all">
                    <i class="fas fa-globe"></i>
                    <span>All Posts</span>
                </div>
                <div class="category-item" data-category="tech">
                    <i class="fas fa-laptop-code"></i>
                    <span>Technology</span>
                </div>
                <div class="category-item" data-category="entertainment">
                    <i class="fas fa-film"></i>
                    <span>Entertainment</span>
                </div>
                <div class="category-item" data-category="sports">
                    <i class="fas fa-football-ball"></i>
                    <span>Sports</span>
                </div>
                <div class="category-item" data-category="lifestyle">
                    <i class="fas fa-heart"></i>
                    <span>Lifestyle</span>
                </div>
                <div class="category-item" data-category="games">
                    <i class="fas fa-gamepad"></i>
                    <span>Gaming</span>
                </div>
            </div>
        </div>
        
        <!-- Community Stats -->
        <div class="stats-widget">
            <h4>Community Stats</h4>
            <div class="stat-item">
                <i class="fas fa-users"></i>
                <div class="stat-info">
                    <span class="stat-number" id="totalUsers">0</span>
                    <span class="stat-label">Total Users</span>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-edit"></i>
                <div class="stat-info">
                    <span class="stat-number" id="totalPosts">0</span>
                    <span class="stat-label">Posts Today</span>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-comments"></i>
                <div class="stat-info">
                    <span class="stat-number" id="totalComments">0</span>
                    <span class="stat-label">Active Chats</span>
                </div>
            </div>
        </div>
        
        <!-- Forum Rules -->
        <div class="rules-widget">
            <h4>Community Guidelines</h4>
            <ul class="rules-list">
                <li><i class="fas fa-check"></i> Be respectful to all members</li>
                <li><i class="fas fa-check"></i> No spam or self-promotion</li>
                <li><i class="fas fa-check"></i> Stay on topic in discussions</li>
                <li><i class="fas fa-check"></i> Report inappropriate content</li>
            </ul>
        </div>
    </div>
    
    <!-- Enhanced Chat Interface -->
    <div class="chat-interface" id="chatInterface">
        <div class="chat-header">
            <div class="chat-user-info">
                <img src="" alt="User" class="chat-avatar">
                <div class="chat-user-details">
                    <span class="chat-username"></span>
                    <span class="chat-status">Online</span>
                </div>
            </div>
            <div class="chat-actions">
                <button class="chat-minimize" id="minimizeChat">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="chat-close" id="closeChat">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input-area">
            <div class="typing-indicator" id="typingIndicator">
                <span></span> is typing...
            </div>
            <div class="input-container">
                <input type="text" id="chatInput" placeholder="Type your message...">
                <input type="hidden" class="receiverId" value="">
                <button id="sendMessage" class="send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Messages Thread -->
    <div class="messageThread">
        <!-- Message threads will be populated here -->
    </div>

    <!-- Create Post Modal -->
    <div class="create-post">
        <div class="modal-header">
            <h3>
                <i class="fas fa-pen"></i>
                Create New Post
            </h3>
            <button class="close-modal" id="closePostModal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form id="createPostForm">
            <input type="hidden" name="identity" value="post">
            <div class="form-group">
                <label for="postTitle">Post Title</label>
                <input type="text" name="title" id="postTitle" placeholder="What's your post about?" required>
            </div>
            <div class="form-group">
                <label for="postContent">Content</label>
                <textarea id="postContent" name="content" placeholder="Share your thoughts with the community..." required></textarea>
            </div>
            <div class="form-group">
                <label>Categories (select one or more)</label>
                <div class="checkbox-group">
                    <label class="checkbox-item">
                        <input type="checkbox" name="entertainment" id="entertainment" value="entertainment">
                        <span class="checkmark"></span>
                        Entertainment
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" name="tech" id="tech" value="tech">
                        <span class="checkmark"></span>
                        Technology
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" name="lifestyle" id="lifestyle" value="lifestyle">
                        <span class="checkmark"></span>
                        Lifestyle
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" name="sports" id="sports" value="sports">
                        <span class="checkmark"></span>
                        Sports
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" name="games" id="games" value="games">
                        <span class="checkmark"></span>
                        Gaming
                    </label>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="cancelPost">Cancel</button>
                <button type="submit" class="btn-submit">
                    <i class="fas fa-paper-plane"></i>
                    Publish Post
                </button>
            </div>
        </form>
    </div>
    
    <!-- User Panel -->
    <div class="userPanel">
        <div class="userdetails">
            <img src="https://ui-avatars.com/api/?name=${name}&background=4A90E2&color=fff&size=100" alt="Avatar" class="avatar">
            <div id="userNickName"></div>
        </div>
        
        <div class="userfilter">
            <h3 class="sidetitle">Profile Information</h3>
            <div class="user-details">
                <p>
                    <i class="fas fa-user"></i>
                    <span id="user-fullname"></span>
                </p>
                <p>
                    <i class="fas fa-birthday-cake"></i>
                    <span id="user-age"></span> years old
                </p>
                <p>
                    <i class="fas fa-envelope"></i>
                    <span id="user-email"></span>
                </p>
            </div>
        </div>
        
        <div class="userFunctions">
            <ul class="sidelist">
                <li class="nav-link-logout">
                    <button class="nav-link-out">
                        <i class="fas fa-sign-out-alt" id="out"></i>
                        Sign Out
                    </button>
                </li>
            </ul>
        </div>
    </div>
`;