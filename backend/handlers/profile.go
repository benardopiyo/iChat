package handlers

import (
	"encoding/json"
	"net/http"

	"real_time_forum/backend/db/controllers"
)

func GetUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")

	if userId == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	user, err := controllers.GetUserProfile(userId)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
