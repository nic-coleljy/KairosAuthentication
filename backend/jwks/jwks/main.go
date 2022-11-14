package main

import (
	"context"
	"crypto/rsa"
	_ "encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/lestrrat-go/jwx/v2/jwk"
	"log"
)

var Session *session.Session

type GetJWKSEvent struct {
}

func main() {
	lambda.Start(GetJWKSHandler)
}

func init() {
	Session = session.Must(session.NewSession(&aws.Config{
		Region: aws.String("ap-southeast-1"),
	}))

	// initialize the connections
	StartS3BucketConnection(Session)
}

type GetJWKSResponse struct {
	Keys    []jwk.Key `json:"keys"`
	Message string    `json:"message"`
}

func GetJWKSHandler(ctx context.Context, name GetJWKSEvent) (*GetJWKSResponse, error) {
	pubKeySet := []jwk.Key{}

	publicKeys, err := getAllPublicKeys()
	if publicKeys == nil {
		log.Println("There was an error getting the public keys", err)
		return nil, err
	}

	for keyId, publicKey := range publicKeys {
		pubKey, err := jwk.FromRaw(publicKey)
		if err != nil {
			log.Println("There was an error parsing the public key", err)
			continue
		}

		if _, ok := pubKey.(jwk.RSAPublicKey); !ok {
			fmt.Printf("expected jwk.RSAPublicKey, got %T\n", pubKey)
			return nil, err
		}

		pubKey.Set(jwk.KeyIDKey, keyId)
		pubKey.Set(jwk.AlgorithmKey, "RS256")
		pubKey.Set(jwk.KeyTypeKey, "RSA")
		pubKey.Set(jwk.KeyUsageKey, "sig")

		pubKeySet = append(pubKeySet, pubKey)
	}

	var msg string
	if err != nil {
		msg = fmt.Sprintf("There was an error getting the public keys: %v", err)
	} else {
		msg = fmt.Sprintf("Successfully retrieved %d public keys", len(pubKeySet))
	}

	return &GetJWKSResponse{Keys: pubKeySet, Message: msg}, nil
}

func getAllPublicKeys() (publicKeys map[string]*rsa.PublicKey, err error) {
	publicKeys = make(map[string]*rsa.PublicKey)

	publicKeyIDs, err := s3Bucket.listObjects(PublicKeyCollectionName)
	if err != nil {
		log.Println("There was an error getting the public key ids", err)
		return nil, err
	}

	failedKeyIds := make([]string, 0)
	for _, keyId := range publicKeyIDs {
		publicKey, err := s3Bucket.getObject(PublicKeyCollectionName, keyId)
		if err != nil {
			failedKeyIds = append(failedKeyIds, keyId)
			log.Println("There was an error getting the public key", err)
			continue
		}
		publicKeys[keyId] = publicKey
	}

	if len(failedKeyIds) > 0 {
		err = errors.New(fmt.Sprintf("There was an error getting the public keys for the following key ids: %v", failedKeyIds))
	}
	return publicKeys, err
}
