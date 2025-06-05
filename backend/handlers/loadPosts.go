package handlers

import (
	"encoding/json"
	"net/http"

	"real_time_forum/backend/db/controllers"
)

// LoadAll handles both public and authenticated requests for posts
func LoadAll(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")

	// If no token provided, serve public posts (read-only access)
	if token == "" {
		LoadPublicPosts(w, r)
		return
	}

	// If token provided, validate and serve authenticated content
	if !controllers.ValidSession(token) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Please login to continue"})
		return
	}

	// Load posts for authenticated users
	LoadAuthenticatedPosts(w, r)
}

// LoadPublicPosts serves posts for non-authenticated users (read-only)
func LoadPublicPosts(w http.ResponseWriter, r *http.Request) {
	all, err := controllers.All()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": "Failed to load posts"})
		return
	}

	// Return posts without user-specific interaction data
	if len(all) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"posts": []interface{}{}})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"posts": all})
}

// LoadAuthenticatedPosts serves posts for authenticated users (full functionality)
func LoadAuthenticatedPosts(w http.ResponseWriter, r *http.Request) {
	all, err := controllers.All()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"posts": err.Error()})
		return
	}

	if len(all) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"posts": []interface{}{}})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"posts": all})
}
