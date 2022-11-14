package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type RefreshTokenResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func RefreshTokenHandler(w http.ResponseWriter, r *http.Request) {
	// get the token from the request
	var req RefreshTokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// verify the token
	newAccessToken, newRefreshToken, err := refreshSession(req.RefreshToken)
	if err != nil {
		log.Println("There was an error refreshing the session", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// return the token
	json.NewEncoder(w).Encode(RefreshTokenResponse{newAccessToken, newRefreshToken})
}

func refreshSession(refreshToken string) (string, string, error) {
	claims, err := extractClaims(refreshToken)
	if err != nil {
		return "", "", err
	}

	newAccessToken, newRefreshToken, err := GenToken(claims["userId"].(string))
	if err != nil {
		return "", "", err
	}

	return newAccessToken, newRefreshToken, nil
}
