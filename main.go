// File: main.go

package main

import (
	"log"
	"net/http"

	"real_time_forum/backend/db/controllers"
	"real_time_forum/backend/handlers"
	"real_time_forum/backend/socket"
)

func init() {
	controllers.InitDB()
	controllers.CreateTables()
}

// setupRoutes configures all HTTP routes for the application
func setupRoutes() {
	// Static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("frontend/static"))))

	// Authentication routes
	http.HandleFunc("/login", handlers.HandleLogin)
	http.HandleFunc("/signup", handlers.SignupHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)

	// Post routes
	http.HandleFunc("/home", handlers.LoadAll) // Handles both public and authenticated requests
	http.HandleFunc("/createPost", handlers.PostHandler)
	http.HandleFunc("/likePost", handlers.LikesHandler)
	http.HandleFunc("/dislikePost", handlers.DislikeHandler)

	// Comment routes
	http.HandleFunc("/createComment", handlers.HandleComment)

	// Messaging routes
	http.HandleFunc("/privateMessage", handlers.HandlePrivateMessage)
	http.HandleFunc("/getusermessages", handlers.GetUserMessages)

	// WebSocket route
	http.HandleFunc("/ws", socket.HandleRequest)

	// Main route - serves the single HTML file
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		file := "frontend/templates/index.html"
		http.ServeFile(w, r, file)
	})
}

func main() {
	// Setup all routes
	setupRoutes()

	// Start server
	log.Println("🚀 RealForum server starting on port 8080: http://localhost:8080/welcome")

	log.Fatal(http.ListenAndServe(":8080", nil))
}
