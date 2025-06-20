package handlers

import (
	"encoding/json"
	"net/http"

	"real_time_forum/backend/db/controllers"
)

// AuthMiddleware checks if user is authenticated for protected routes
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get token from query parameter or cookie
		token := r.URL.Query().Get("token")
		if token == "" {
			// Try to get from cookie
			cookie, err := r.Cookie("session_token")
			if err == nil {
				token = cookie.Value
			}
		}

		// Check if token is valid
		if token == "" || !controllers.ValidSession(token) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Authentication required. Please login to continue.",
			})
			return
		}

		// User is authenticated, proceed to next handler
		next.ServeHTTP(w, r)
	}
}

// StrictAuthMiddleware - Even stricter authentication that doesn't fall back to public
func StrictAuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get token from query parameter or cookie
		token := r.URL.Query().Get("token")
		if token == "" {
			// Try to get from cookie
			cookie, err := r.Cookie("session_token")
			if err == nil {
				token = cookie.Value
			}
		}

		// Strict check - no token = no access
		if token == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Premium access required. Please login to continue.",
			})
			return
		}

		// Validate session
		if !controllers.ValidSession(token) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Session expired. Please login again.",
			})
			return
		}

		// User is authenticated, proceed to next handler
		next.ServeHTTP(w, r)
	}
}

// CORSMiddleware adds CORS headers for frontend-backend communication
func CORSMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Proceed to next handler
		next.ServeHTTP(w, r)
	}
}

// LoggingMiddleware logs incoming requests
func LoggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Log request details
		// log.Printf("%s %s %s", r.Method, r.URL.Path, r.RemoteAddr)

		// Proceed to next handler
		next.ServeHTTP(w, r)
	}
}

// GetUserFromRequest extracts user information from request
func GetUserFromRequest(r *http.Request) (string, string, error) {
	// Get token from query parameter or cookie
	token := r.URL.Query().Get("token")
	if token == "" {
		// Try to get from cookie
		cookie, err := r.Cookie("session_token")
		if err != nil {
			return "", "", err
		}
		token = cookie.Value
	}

	// Validate session and get user details
	if !controllers.ValidSession(token) {
		return "", "", http.ErrNoCookie
	}

	userID, username, _, err := controllers.GetUserDetailsFromSession(token)
	return userID, username, err
}