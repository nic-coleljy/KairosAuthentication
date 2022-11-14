package main

import (
	crypRand "crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func GetPublicKeySetHandler(w http.ResponseWriter, r *http.Request) {
	publicKeySet := getPublicKeySet()
	data, err := json.Marshal(publicKeySet)
	if err != nil {
		log.Println("There was an error marshalling the public key set", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write(data)
}

func startNewKeySet() {
	keySet = make(map[string]*RSAKeyPair)
	for i := 0; i < 10; i++ {
		keyPair, err := genKeyPair()
		if err != nil {
			log.Println("There was an error generating a key pair", err)
			continue
		}
		keySet[fmt.Sprintf("key%d", i)] = keyPair
	}
}

type GetPublicKeySetResponse struct {
	PublicKeySet map[string][]byte `json:"public_key_set"`
}

func getPublicKeySet() *GetPublicKeySetResponse {
	publicKeySet := make(map[string][]byte)
	for keyId, keyPair := range keySet {

		publicKeyBytes, err := x509.MarshalPKIXPublicKey(keyPair.PublicKey)
		if err != nil {
			fmt.Printf("Cannot marshal public key")
			continue
		}

		publicKeySet[keyId] = publicKeyBytes
	}
	return &GetPublicKeySetResponse{publicKeySet}
}

func genKeyPair() (*RSAKeyPair, error) {
	// generate the key pair
	privateKey, err := rsa.GenerateKey(crypRand.Reader, 2048)
	if err != nil {
		fmt.Printf("Cannot generate RSA key pair")
		return nil, err
	}

	return &RSAKeyPair{privateKey, &privateKey.PublicKey}, nil
}
