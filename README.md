# 🌟 iChat - Real Time Social Platform

<div align="center">

![iChat Logo](https://img.shields.io/badge/iChat-Live%20Forum-4A90E2?style=for-the-badge&logo=chat&logoColor=white)

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go&logoColor=white)](https://golang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real%20Time-FF6B6B?style=flat&logo=websocket&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

*A modern, real-time social platform where communities connect, share ideas, and engage in meaningful conversations*

[Live Demo](#-quick-start) • [Documentation](#-features) • [Chat System](#-private-messaging-system) • [Installation](#-installation)

</div>

---

## 🎯 **What is iChat?**

iChat is a **cutting-edge social platform** that brings people together through real-time conversations, thoughtful posts, and instant messaging. Built with modern web technologies, it offers a seamless experience for users to connect, share, and engage with their community.

### ✨ **Why iChat?**

```diff
+ Real-time messaging with WebSocket technology
+ Beautiful, responsive UI with professional design
+ Secure authentication and session management  
+ Mobile-first responsive design
+ Lightning-fast performance
+ Modern single-page application architecture
```

---

## **Features**

### 🔐 **Smart Authentication System**
<details>
<summary><b>Click to expand authentication features</b></summary>

```yaml
Registration Requirements:
  ✅ Unique Nickname
  ✅ Age & Gender
  ✅ Full Name (First & Last)
  ✅ Valid Email Address
  ✅ Secure Password

Login Options:
  📧 Email + Password
  👤 Nickname + Password
  
Security:
  🔒 Password hashing with bcrypt
  🍪 Secure session management
  🚪 One-click logout from any page
```
</details>

### 📝 **Dynamic Posts & Comments**
<details>
<summary><b>Click to expand posting features</b></summary>

```yaml
Post Creation:
  📋 Rich text content
  🏷️ Multiple categories (Tech, Entertainment, Sports, etc.)
  👤 Author attribution
  📅 Timestamp tracking

Interaction:
  💬 Real-time commenting
  👍 Like/Dislike system
  📊 Engagement metrics
  🔍 Category filtering

Display:
  📱 Responsive feed layout
  🎨 Professional card design
  ⚡ Smooth animations
  🔄 Real-time updates
```
</details>

### 💬 **Advanced Private Messaging System**
<details>
<summary><b>Click to expand chat features</b></summary>

```yaml
Real-Time Chat:
  🟢 Online/Offline status indicators
  ⚡ Instant message delivery via WebSocket
  💭 Typing indicators
  📱 Mobile-optimized chat interface

Smart Organization:
  📋 Auto-sorted by recent messages
  🔤 Alphabetical fallback for new users
  📜 Message history with infinite scroll
  🔄 Last 10 messages loaded initially

Message Features:
  ⏰ Timestamp display
  👤 Sender identification
  📱 Mobile-friendly chat bubbles
  🎯 Optimized with throttle/debounce
```
</details>

---

## **Technology Stack**

<div align="center">

| Frontend | Backend | Database | Real-Time |
|----------|---------|----------|-----------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | ![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white) | ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white) | ![WebSocket](https://img.shields.io/badge/WebSocket-FF6B6B?style=flat&logo=websocket&logoColor=white) |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | ![Gorilla](https://img.shields.io/badge/Gorilla_WS-00ADD8?style=flat&logo=go&logoColor=white) | ![bcrypt](https://img.shields.io/badge/bcrypt-Security-green?style=flat) | ![Real-Time](https://img.shields.io/badge/Real_Time-Updates-success?style=flat) |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | ![UUID](https://img.shields.io/badge/UUID-Generator-blue?style=flat) | | |

</div>

---

## **Quick Start**

### **Prerequisites**

```bash
# Check if Go is installed
go version  # Should be 1.21 or higher

# If not installed:
# Ubuntu/Debian
sudo apt install golang-go

# macOS
brew install go

# Windows
# Download from https://golang.org/dl/
```

### ⚡ **Installation**

```bash
# 1️⃣ Clone the repository
git clone https://learn.zone01kisumu.ke/git/beopiyo/real-time-forum
cd real-time-forum

# 2️⃣ Run the application
make

# 🎉 That's it! Server will start on http://localhost:8080
```

### 🌐 **Access the Application**

```yaml
Landing Page:     http://localhost:8080/
Login Page:       http://localhost:8080/signin  
Register Page:    http://localhost:8080/signups
Welcome Page:     http://localhost:8080/welcome
```

---

## 📱 **User Experience**

### 🎨 **Beautiful Interface**
```
┌─────────────────────────────────────────────────────────┐
│  🏠 iChat                     🔍 Search    👤 Profile │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👥 Online Users          Community Feed             │
│  ├ 🟢 Alice              ┌─────────────────────────┐    │
│  ├ 🟢 Bob                │ 📝 Latest Post          │    │
│  └ 🟢 Charlie            │ 💬 5 comments           │    │
│                          │ 👍 12  👎 2             │    │
│  💬 Recent Chats         └─────────────────────────┘    │
│  ├ Alice: Hey there!                                    │
│  └ Bob: How's it going?   🏷️ Categories                 │
│                          ├ 💻 Technology                │
│  ➕ Post                 ├ 🎬 Entertainment            │
│                          └ ⚽ Sports                    │
└─────────────────────────────────────────────────────────┘
```

### 📱 **Mobile Responsive**
- ✅ **Touch-friendly interface**
- ✅ **Swipe gestures**
- ✅ **Optimized for small screens**
- ✅ **Fast loading times**

---

## 🔧 **Project Structure**

```
real-time-forum/
├── 📁 backend/
│   ├── 📁 db/
│   │   ├── 📁 controllers/    # Database operations
│   │   └── 📁 models/         # Data structures
│   ├── 📁 handlers/          # HTTP request handlers
│   └── 📁 socket/            # WebSocket management
├── 📁 frontend/
│   ├── 📁 static/
│   │   ├── 📁 css/           # Stylesheets
│   │   └── 📁 js/            # JavaScript modules
│   └── 📁 templates/         # HTML templates
├── 🔧 Makefile              # Build automation
└── 📖 README.md             # This file
```

---

## 🎯 **Key Features in Action**

### 💬 **Real-Time Messaging**
```javascript
// WebSocket connection for instant messaging
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "new_message") {
        displayMessage(message.data);
        showNotification("New message received!");
    }
};
```

### 🔐 **Secure Authentication**
```go
// Password hashing with bcrypt
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 14)
if err != nil {
    return err
}
```

### ⚡ **Optimized Performance**
```javascript
// Throttled scroll loading for chat history
const throttledScroll = throttle(() => {
    if (chatContainer.scrollTop === 0) {
        loadMoreMessages();
    }
}, 100);
```

---

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

```bash
# 1️⃣ Fork the repository
# 2️⃣ Create your feature branch
git checkout -b feature/amazing-feature

# 3️⃣ Commit your changes
git commit -m "Add amazing feature"

# 4️⃣ Push to the branch
git push origin feature/amazing-feature

# 5️⃣ Open a Pull Request
```

---

## 📸 **Screenshots**

<div align="center">

### 🏠 **Landing Page**
*Beautiful, welcoming interface that invites users to join*

### 💬 **Chat Interface** 
*Real-time messaging with typing indicators and online status*

### 📝 **Post Creation**
*Intuitive post creation with category selection*

### 📱 **Mobile Experience**
*Fully responsive design that works on all devices*

</div>

---

## 🚀 **Deployment**

### 🐳 **Docker Support** (Coming Soon)
```dockerfile
# Dockerfile will be added for easy deployment
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o iChat
EXPOSE 8080
CMD ["./iChat"]
```

### ☁️ **Cloud Ready**
- ✅ **Heroku compatible**
- ✅ **Docker containerized**
- ✅ **Environment variable support**
- ✅ **Production optimized**

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 **Show Your Support**

If you found this project helpful, please consider:

- ⭐ **Starring the repository**
- 🐛 **Reporting bugs**
- 💡 **Suggesting features**
- 🤝 **Contributing code**

---

<div align="center">

### 🎉 **Ready to Connect?**

**[Start Your Journey](http://localhost:8080) • [Join the Community](#) • [Get Support](#)**

---

*Made with ❤️ by a gopher who believe in bringing people together*

[![GitHub stars](https://img.shields.io/github/stars/username/real-time-forum?style=social)](https://github.com/benardopiyo/iChat)
[![GitHub forks](https://img.shields.io/github/forks/username/real-time-forum?style=social)](https://github.com/benardopiyo/iChat)

</div>