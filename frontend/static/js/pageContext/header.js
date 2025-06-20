// File: frontend/static/js/pageContext/header.js

export const headerContext = `
   <div class="search-bar">
        <div class="search-container">
            <div class="search-body">
                <div class="logo">
                    <h1>real<span class="big-x">Time</span></h1>
                </div>
                <div class="search-wrapper">
                </div>
                <div class="nav-links">
                    <div class="user-profile-nav-link nav-link"></div>
                    <div id="user-inbox" class="nav-link"></div>
                    <div id="header-logout-btn" class="nav-link logout-nav-link" style="display: none;" title="Logout" aria-label="Logout from forum">
                        <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                    </div>
                    <div class="messageThread"></div>
                    <div class="chat-wrapper">
                        <div class="chat-container" id="chat"></div>
                        <div class="input-container">
                            <input type="hidden" name="receiverId" class="receiverId">
                            <input type="text" id="messageInput" placeholder="Type your message...">
                            <button id="sendBtn">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;