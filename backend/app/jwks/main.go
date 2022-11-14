package main

import (
	crypRand "crypto/rand"
	"crypto/rsa"
	"encoding/json"
	_ "encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

type RSAKeyPair struct {
	PrivateKey *rsa.PrivateKey
	PublicKey  *rsa.PublicKey
}

var keySet map[string]*RSAKeyPair

func main() {
	// start a separate goroutine that refreshes the key set every month
	go func() {
		for {
			refreshKeySet()
			fmt.Println("New key set generated")
			time.Sleep(30 * 24 * time.Hour)
		}
	}()

	// set up the handlers
	r := mux.NewRouter()

	// jwks endpoint for the public keys, should extract from s3 bucket subsequently
	r.HandleFunc("/jwks.json", GetJWKSHandler).Methods("GET")
	// should only not be exposed, subsequently this will be a lambda function
	// and the signing keys should be pushed to secrets manager
	r.HandleFunc("/signing.json", GetSigningKeysHandler).Methods("GET")

	r.HandleFunc("/health", HealthHandler).Methods("GET")
	http.Handle("/", r)

	// handler func
	fmt.Println("Starting server on port 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Println("There was an error listening on port :8080", err)
	}
}

func GetJWKSHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(GetJwksData())
}

func GetSigningKeysHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(GetSigningKeysData())
}

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Health check")
	w.WriteHeader(http.StatusOK)
}

type SigningKeysJsonResp struct {
	Keys []jwk.Key `json:"keys"`
}

func GetSigningKeysData() (encoded []byte) {
	signingKeySet := []jwk.Key{}
	for keyId, keyPair := range keySet {
		signingKey, err := jwk.FromRaw(keyPair.PrivateKey)
		if err != nil {
			log.Println("There was an error parsing the public key", err)
			continue
		}

		if _, ok := signingKey.(jwk.RSAPrivateKey); !ok {
			fmt.Printf("expected jwk.RSAPrivateKey, got %T\n", signingKey)
			return
		}

		signingKey.Set(jwk.KeyIDKey, keyId)
		signingKey.Set(jwk.AlgorithmKey, "RS256")
		signingKey.Set(jwk.KeyTypeKey, "RSA")
		signingKey.Set(jwk.KeyUsageKey, "sig")

		signingKeySet = append(signingKeySet, signingKey)
	}

	encoded, _ = json.Marshal(SigningKeysJsonResp{Keys: signingKeySet})
	return
}

type JwksJsonResp struct {
	Keys []jwk.Key `json:"keys"`
}

func GetJwksData() (encoded []byte) {
	pubKeySet := []jwk.Key{}
	for keyId, keyPair := range keySet {
		jwksKey, err := jwk.FromRaw(keyPair.PublicKey)
		if err != nil {
			log.Println("There was an error parsing the public key", err)
			continue
		}

		if _, ok := jwksKey.(jwk.RSAPublicKey); !ok {
			fmt.Printf("expected jwk.RSAPublicKey, got %T\n", jwksKey)
			return
		}

		jwksKey.Set(jwk.KeyIDKey, keyId)
		jwksKey.Set(jwk.AlgorithmKey, "RS256")
		jwksKey.Set(jwk.KeyTypeKey, "RSA")
		jwksKey.Set(jwk.KeyUsageKey, "sig")

		pubKeySet = append(pubKeySet, jwksKey)
	}

	encoded, _ = json.Marshal(JwksJsonResp{Keys: pubKeySet})
	return
}

func refreshKeySet() {
	keySet = make(map[string]*RSAKeyPair)
	for i := 0; i < 10; i++ {
		keyPair, err := genKeyPair()

		// fmt.Println("Generating key pair", i)
		// fmt.Println(string(pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(keyPair.PrivateKey)})))
		// fmt.Println(string(pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: x509.MarshalPKCS1PublicKey(keyPair.PublicKey)})))

		if err != nil {
			log.Println("There was an error generating a key pair", err)
			continue
		}
		keySet[fmt.Sprintf("key%d", i)] = keyPair
	}
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
