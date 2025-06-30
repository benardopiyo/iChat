package router

import (
	"net/http"

	"real_time_forum/backend/handlers"
	"real_time_forum/backend/socket"
)

// setupRoutes configures all HTTP routes for the application
func Routes() {
	// Static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("frontend/static"))))

	// Authentication routes (public access)
	http.HandleFunc("/login", handlers.HandleLogin)
	http.HandleFunc("/signup", handlers.SignupHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)

	// Protected routes - require authentication
	http.HandleFunc("/home", handlers.AuthMiddleware(handlers.LoadAuthenticatedPosts))
	http.HandleFunc("/createPost", handlers.AuthMiddleware(handlers.PostHandler))
	http.HandleFunc("/likePost", handlers.AuthMiddleware(handlers.LikesHandler))
	http.HandleFunc("/dislikePost", handlers.AuthMiddleware(handlers.DislikeHandler))

	// Comment routes - require authentication
	http.HandleFunc("/createComment", handlers.AuthMiddleware(handlers.HandleComment))

	// Messaging routes - require authentication
	http.HandleFunc("/privateMessage", handlers.AuthMiddleware(handlers.HandlePrivateMessage))
	http.HandleFunc("/getusermessages", handlers.AuthMiddleware(handlers.GetUserMessages))

	http.HandleFunc("/upload-image", handlers.AuthMiddleware(handlers.UploadImageHandler))

	http.HandleFunc("/user-profile", handlers.AuthMiddleware(handlers.GetUserProfileHandler))

	// WebSocket route - authentication handled in socket
	http.HandleFunc("/ws", socket.HandleRequest)

	// Main route - serves the single HTML file
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		file := "frontend/templates/index.html"
		http.ServeFile(w, r, file)
	})
}