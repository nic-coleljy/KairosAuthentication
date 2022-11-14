package main

import (
	"context"
	crypRand "crypto/rand"
	"crypto/rsa"
	_ "encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/google/uuid"
	"log"
)

type RSAKeyPair struct {
	PrivateKey *rsa.PrivateKey
	PublicKey  *rsa.PublicKey
}

const KeySetLength = 1

var Session *session.Session

type RefreshEvent struct {
}

func main() {
	lambda.Start(RefreshKeySetHandler)
	//r.HandleFunc("/refresh", RefreshKeySetHandler).Methods("POST")
}

func init() {
	Session = session.Must(session.NewSession(&aws.Config{
		Region: aws.String("ap-southeast-1"),
	}))

	// initialize the connections
	StartS3BucketConnection(Session)
	StartAWSSecretManagerConnection(Session)
}

type RefreshKeySetResponse struct {
	PublicKeyIds        []string `json:"publicKeyIds"`
	KeyCleaningErrors   []error  `json:"keyCleaningErrors"`   // errors encountered when deleting old keys
	KeyGenerationErrors []error  `json:"keyGenerationErrors"` // errors encountered when deleting old keys
}

func RefreshKeySetHandler(ctx context.Context, name RefreshEvent) (*RefreshKeySetResponse, error) {
	keyGenerationErrors, keyCleaningErrors := refreshKeySet()
	keyIds, err := s3Bucket.listObjects(PublicKeyCollectionName)
	if err != nil {
		log.Println("There was an error getting the public key ids", err)
	}

	return &RefreshKeySetResponse{PublicKeyIds: keyIds, KeyCleaningErrors: keyCleaningErrors, KeyGenerationErrors: keyGenerationErrors}, nil
}

func refreshKeySet() (keyCleaningErrors []error, keyGenerationErrors []error) {
	keyGenerationErrors = make([]error, 0)

	// delete the old keys
	keyCleaningErrors = deleteOldKeys()

	// generate the new keys
	for i := 0; i < KeySetLength; i++ {
		keyId := uuid.New().String()
		keyPair, err := genKeyPair()

		// fmt.Println("Generating key pair", i)
		// fmt.Println(string(pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(keyPair.PrivateKey)})))
		// fmt.Println(string(pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: x509.MarshalPKCS1PublicKey(keyPair.PublicKey)})))

		if err != nil {
			log.Println("There was an error generating a key pair", err)
			keyGenerationErrors = append(keyGenerationErrors, err)
			continue
		}

		// insert the public key into s3 bucket
		err = s3Bucket.insertObject(PublicKeyCollectionName, keyId, keyPair.PublicKey)
		if err != nil {
			log.Println("There was an error inserting the public key into s3 bucket", err)
			keyGenerationErrors = append(keyGenerationErrors, err)
			continue
		}

		// insert the private key into secrets manager
		err = secretsManagerClient.insertSecret(keyId, keyPair.PrivateKey)
		if err != nil {
			log.Println("There was an error inserting the private key into secrets manager", err)
			keyGenerationErrors = append(keyGenerationErrors, err)
			continue
		}
	}

	return
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

func deleteOldKeys() []error {
	keyIds, err := s3Bucket.listObjects(PublicKeyCollectionName)
	if err != nil {
		log.Println("There was an error getting the key ids", err)
		return []error{err}
	}

	errorsEncountered := make([]error, 0)
	if err := deleteOldPubKeys(keyIds); err != nil {
		errorsEncountered = append(errorsEncountered, err)
	}
	if err := deleteOldPrivKeys(keyIds); err != nil {
		errorsEncountered = append(errorsEncountered, err)
	}

	return errorsEncountered
}

func deleteOldPubKeys(keyIds []string) error {
	failedKeyIds := make([]string, 0)

	for _, keyId := range keyIds {
		err := s3Bucket.deleteObject(PublicKeyCollectionName, keyId)
		if err != nil {
			log.Println("There was an error deleting the old public key", err)
			failedKeyIds = append(failedKeyIds, keyId)
		}
	}

	if len(failedKeyIds) > 0 {
		return errors.New(fmt.Sprintf("There was an error deleting the old public keys for the following key ids: %v", failedKeyIds))
	}

	return nil
}

func deleteOldPrivKeys(keyIds []string) error {
	failedKeyIds := make([]string, 0)

	for _, keyId := range keyIds {
		err := secretsManagerClient.deleteSecret(keyId)
		if err != nil {
			log.Println("There was an error deleting the old private key", err)
			failedKeyIds = append(failedKeyIds, keyId)
		}
	}

	if len(failedKeyIds) > 0 {
		return errors.New(fmt.Sprintf("There was an error deleting the old private keys for the following key ids: %v", failedKeyIds))
	}

	return nil
}
