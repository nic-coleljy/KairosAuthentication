package main

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"math/rand"
	"time"
)

func getPemBlock(privateKey *rsa.PrivateKey, publicKey *rsa.PublicKey) ([]*pem.Block, error) {
	privateKeyBytes := x509.MarshalPKCS1PrivateKey(privateKey)
	privateKeyBlock := &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	}

	publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		fmt.Printf("Cannot marshal public key")
		return nil, err
	}
	publicKeyBlock := &pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: publicKeyBytes,
	}

	return []*pem.Block{privateKeyBlock, publicKeyBlock}, nil
}

func getNextKeyID() (string, error) {
	rand.Seed(time.Now().UnixNano())
	min := 0
	max := len(keySet)

	idx := rand.Intn(max-min) + min

	for keyId, _ := range keySet {
		if idx == 0 {
			return keyId, nil
		}
		idx--
	}

	return "", fmt.Errorf("key is not available")
}
