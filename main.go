// File: main.go

package main

import (
	"log"
	"net/http"

	"real_time_forum/backend/db/controllers"
	"real_time_forum/backend/router"
)

func init() {
	controllers.InitDB()
	controllers.CreateTables()
}

func main() {
	router.Routes()

	log.Println("Server running on http://localhost:8080")

	log.Fatal(http.ListenAndServe(":8080", nil))
}
