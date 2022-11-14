package main

import (
	"crypto/rsa"
	"encoding/json"
	"github.com/golang-jwt/jwt"
	"log"
	"net/http"
	"time"
)

const (
	AccessTokenExpiryTimeInMinutes  = 10
	RefreshTokenExpiryTimeInMinutes = 4 * 60
)

type RSAKeyPair struct {
	PrivateKey *rsa.PrivateKey
	PublicKey  *rsa.PublicKey
}

var keySet map[string]*RSAKeyPair

type GetTokenRequest struct {
	UserID string `json:"UserId"`
}

type GetTokenResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func GetTokenHandler(w http.ResponseWriter, r *http.Request) {
	// get the userID and role from the request
	var req GetTokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// generate the token
	tokenString, refreshToken, err := GenToken(req.UserID)
	if err != nil {
		log.Println("There was an error generating the token", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// return the token
	json.NewEncoder(w).Encode(GetTokenResponse{tokenString, refreshToken})
}

func GenToken(userId string) (string, string, error) {
	accessTokenString, err := generateJWT(userId, AccessTokenExpiryTimeInMinutes)
	if err != nil {
		log.Fatalln("Error generating JWT (access token)", err)
		return "", "", err
	}

	refreshTokenString, err := generateJWT(userId, RefreshTokenExpiryTimeInMinutes)
	if err != nil {
		log.Fatalln("Error generating JWT (refresh token)", err)
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

func generateJWT(userId string, minutesToExpiry int) (string, error) {
	keyId, err := getNextKeyID()
	if err != nil {
		log.Println("There was an error getting the next key", err)
		return "", err
	}

	token := jwt.New(jwt.SigningMethodRS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["exp"] = time.Now().Add(time.Duration(minutesToExpiry) * time.Minute).Unix()
	claims["keyId"] = keyId
	claims["userId"] = userId
	tokenString, err := token.SignedString(keySet[keyId].PrivateKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
