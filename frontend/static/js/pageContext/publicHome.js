export const publicHomePage = `
    <div class="public-hero">
        <div class="hero-content">
            <h1>Welcome to <span class="brand">RealForum</span></h1>
            <p class="hero-subtitle">Connect with people, share ideas, and engage in meaningful conversations</p>
            <div class="hero-actions">
                <button id="publicLoginBtn" class="btn-primary">
                    <i class="fas fa-sign-in-alt"></i>
                    Login
                </button>
                <button id="publicSignupBtn" class="btn-secondary">
                    <i class="fas fa-user-plus"></i>
                    Join Now
                </button>
            </div>
        </div>
        <div class="hero-features">
            <div class="feature">
                <i class="fas fa-comments"></i>
                <h3>Real-time Chat</h3>
                <p>Instant messaging with online users</p>
            </div>
            <div class="feature">
                <i class="fas fa-edit"></i>
                <h3>Create Posts</h3>
                <p>Share your thoughts and ideas</p>
            </div>
            <div class="feature">
                <i class="fas fa-users"></i>
                <h3>Join Community</h3>
                <p>Connect with like-minded people</p>
            </div>
        </div>
    </div>
    
    <div class="public-posts-section">
        <div class="section-header">
            <h2>Latest Discussions</h2>
            <p>See what the community is talking about</p>
        </div>
        <div class="posts-section"></div>
        <div class="join-prompt">
            <div class="join-content">
                <h3>Want to join the conversation?</h3>
                <p>Create an account to post, comment, and chat with other members</p>
                <div class="join-actions">
                    <button id="joinNowBtn" class="btn-primary">Join RealForum</button>
                    <button id="learnMoreBtn" class="btn-outline">Learn More</button>
                </div>
            </div>
        </div>
    </div>
`;