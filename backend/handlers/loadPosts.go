package handlers

import (
	"encoding/json"
	"net/http"

	"real_time_forum/backend/db/controllers"
)

// LoadAuthenticatedPosts serves posts for authenticated users only
func LoadAuthenticatedPosts(w http.ResponseWriter, r *http.Request) {
	// Authentication is already verified by middleware
	all, err := controllers.All()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": "Failed to load posts"})
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