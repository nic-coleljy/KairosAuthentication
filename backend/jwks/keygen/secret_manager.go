package main

import (
	"crypto/rsa"
	"crypto/x509"
	crypx509 "crypto/x509"
	"encoding/pem"
	"errors"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
)

const DaysToRetainDuringDeletion = 7

type SecretManager struct {
	client *secretsmanager.SecretsManager
}

var secretsManagerClient *SecretManager

func StartAWSSecretManagerConnection(sess *session.Session) {
	// Create a Secrets Manager client
	secretsManagerClient = &SecretManager{secretsmanager.New(sess)}
}

func (s *SecretManager) insertSecret(secretName string, secretValue interface{}) error {
	secretValueCasted, ok := secretValue.(*rsa.PrivateKey)
	if !ok {
		return errors.New("secretValue is not of type *rsa.PrivateKey")
	}

	pemdata := parseSecretKeyToBinary(secretValueCasted)

	// Create a secret with the specified name
	_, err := s.client.CreateSecret(&secretsmanager.CreateSecretInput{
		Name:         &secretName,
		SecretBinary: pemdata,
	})
	if err != nil {
		return err
	}

	return nil
}

func (s *SecretManager) getSecret(secretName string) (*rsa.PrivateKey, error) {
	// Get the secret with the specified name
	result, err := s.client.GetSecretValue(&secretsmanager.GetSecretValueInput{
		SecretId: &secretName,
	})
	if err != nil {
		return nil, err
	}

	// Return the secret value
	return unmarshalSecretKeyBinary(result.SecretBinary)
}

func (s *SecretManager) updateSecret(secretName string, secretValue interface{}) error {
	secretValueCasted, ok := secretValue.(*rsa.PrivateKey)
	if !ok {
		return errors.New("secretValue is not of type *rsa.PrivateKey")
	}
	pemdata := parseSecretKeyToBinary(secretValueCasted)

	// Update the secret with the specified name
	_, err := s.client.UpdateSecret(&secretsmanager.UpdateSecretInput{
		SecretId:     &secretName,
		SecretBinary: pemdata,
	})
	if err != nil {
		return err
	}

	return nil
}

func (s *SecretManager) deleteSecret(secretName string) error {
	daysToRetain := int64(DaysToRetainDuringDeletion)

	// // If replication logic is used in storing secrets, then the secret must be replicated to other regions before it can be deleted
	//_, err := s.client.RemoveRegionsFromReplication(&secretsmanager.RemoveRegionsFromReplicationInput{
	//	SecretId: &secretName,
	//})
	//if err != nil {
	//	return err
	//}

	// Delete the secret with the specified name
	_, err := s.client.DeleteSecret(&secretsmanager.DeleteSecretInput{
		SecretId:             &secretName,
		RecoveryWindowInDays: &daysToRetain,
	})
	if err != nil {
		return err
	}

	return nil
}

func parseSecretKeyToBinary(secretValue *rsa.PrivateKey) []byte {
	// Create the secret with the specified name
	pemdata := pem.EncodeToMemory(
		&pem.Block{
			Type:  "PRIVATE KEY",
			Bytes: x509.MarshalPKCS1PrivateKey(secretValue),
		},
	)

	return pemdata
}

func unmarshalSecretKeyBinary(data []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, errors.New("failed to decode PEM block containing the key")
	}

	// Create the secret with the specified name
	priv, err := crypx509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	return priv, nil
}
