package main

import (
	_ "encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func main() {
	// start a separate goroutine that refreshes the key set every month
	go func() {
		for {
			startNewKeySet()
			fmt.Println("New key set generated")
			time.Sleep(30 * 24 * time.Hour)
		}
	}()

	// set up the handlers
	r := mux.NewRouter()
	r.HandleFunc("/public-key-set", GetPublicKeySetHandler).Methods("GET")
	r.HandleFunc("/public-key", GetPublicKeyHandler).Methods("POST")
	r.HandleFunc("/token", GetTokenHandler).Methods("POST")
	r.HandleFunc("/auth-token", AuthTokenHandler).Methods("POST")
	r.HandleFunc("/refresh-token", RefreshTokenHandler).Methods("POST")
	r.HandleFunc("/health", HealthHandler).Methods("GET")
	http.Handle("/", r)

	// handler func
	fmt.Println("Starting server on port 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Println("There was an error listening on port :8080", err)
	}
}

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Health check")
	w.WriteHeader(http.StatusOK)
}
