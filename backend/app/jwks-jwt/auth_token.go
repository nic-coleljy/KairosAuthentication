package main

import (
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"github.com/golang-jwt/jwt"
	"log"
	"net/http"
)

type AuthTokenRequest struct {
	AccessToken string `json:"accessToken"`
}

func AuthTokenHandler(w http.ResponseWriter, r *http.Request) {
	// get the token from the request
	var req AuthTokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// verify the token
	isValid, err := verifyJWT(req.AccessToken)
	if err != nil {
		log.Println("There was an error verifying the token", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	fmt.Println("AccessToken is valid: ", isValid)
	if isValid {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusUnauthorized)
	}
}

func parseToken(tokenString, keyId string) (*jwt.Token, error) {
	// parse the token and check that we can get the right key for verifying
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodRSA)
		if !ok {
			return nil, fmt.Errorf("error encountered when parsing token")
		}
		keyPair, ok := keySet[keyId]
		if !ok {
			return nil, fmt.Errorf("keyPair not found")
		}
		// return the public key since we are using the public key for validating
		return keyPair.PublicKey, nil
	})
	// if there's an error, return false
	if err != nil {
		return nil, err
	}

	return token, nil
}

func verifyJWT(tokenString string) (bool, error) {
	keyId, err := getCorrespondingKeyID(tokenString)
	if err != nil {
		return false, fmt.Errorf("keyId not found")
	}

	// parse the token and check that we can get the right key for verifying
	token, err := parseToken(tokenString, keyId)
	// if there's an error, return false
	if err != nil {
		return false, err
	}

	// if there's a token, check that it is valid
	if token.Valid {
		return true, nil
	} else {
		return false, fmt.Errorf("token is invalid")
	}
}

func extractClaims(tokenString string) (map[string]interface{}, error) {
	token, _ := jwt.Parse(tokenString, nil)

	return token.Claims.(jwt.MapClaims), nil
}

func getCorrespondingKeyID(tokenString string) (string, error) {
	claims, err := extractClaims(tokenString)
	if err != nil {
		fmt.Println("There was an error extracting the claims", err)
		return "", err
	}

	keyId, ok := claims["keyId"].(string)
	if !ok {
		return "", fmt.Errorf("keyId not found")
	}

	return keyId, nil
}

func getCorrespondingPublicKey(tokenString string) (interface{}, error) {
	keyId, err := getCorrespondingKeyID(tokenString)
	if err != nil {
		return nil, fmt.Errorf("keyId not found")
	}

	keyPair, ok := keySet[keyId]
	if !ok {
		return nil, fmt.Errorf("keyPair not found")
	}

	return keyPair.PublicKey, nil
}

type GetPublicKeyRequest struct {
	AccessToken string `json:"accessToken"`
}

type GetPublicKeyResponse struct {
	PublicKey *rsa.PublicKey `json:"publicKey"`
}

func GetPublicKeyHandler(w http.ResponseWriter, r *http.Request) {
	var req GetPublicKeyRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	publicKey, err := getCorrespondingPublicKey(req.AccessToken)
	if err != nil {
		log.Println("There was an error getting the public key", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// return the token
	json.NewEncoder(w).Encode(GetPublicKeyResponse{publicKey.(*rsa.PublicKey)})
}
