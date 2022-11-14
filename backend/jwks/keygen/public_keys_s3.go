package main

import (
	"bytes"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"log"
	"time"
)

type S3Bucket struct {
	client *s3.S3
}

var s3Bucket *S3Bucket

const PublicKeyCollectionName = "kairos-jwks"

func StartS3BucketConnection(sess *session.Session) {
	client := s3.New(sess)

	req, _ := client.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String("myBucket"),
		Key:    aws.String("myKey"),
	})

	// get a presigned url for access to and fro bucket
	urlStr, err := req.Presign(15 * time.Minute)
	if err != nil {
		log.Println("Failed to sign request", err)
	}
	log.Println("The URL is", urlStr)

	s3Bucket = &S3Bucket{client}
}

func (s *S3Bucket) insertObject(bucketName string, objectName string, objectValue interface{}) error {

	// make sure the objectValue is of type *rsa.PublicKey
	objectValueCasted, ok := objectValue.(*rsa.PublicKey)
	if !ok {
		return errors.New("objectValue is not of type *rsa.PublicKey")
	}

	// convert the objectValue to binary
	pemdata := parsePublicKeyToBinary(objectValueCasted)

	// Create an object in the specified bucket
	_, err := s.client.PutObject(&s3.PutObjectInput{
		Bucket: &bucketName,
		Key:    &objectName,
		Body:   aws.ReadSeekCloser(bytes.NewReader(pemdata)),
	})
	if err != nil {
		return err
	}

	return nil
}

func (s *S3Bucket) getObject(bucketName string, objectName string) (*rsa.PublicKey, error) {
	// Get the object from the specified bucket
	result, err := s.client.GetObject(&s3.GetObjectInput{
		Bucket: &bucketName,
		Key:    &objectName,
	})
	if err != nil {
		return nil, err
	}

	buf := new(bytes.Buffer)
	buf.ReadFrom(result.Body)

	publicKey, err := unmarshalPublicKeyBinary(buf.Bytes())
	if err != nil {
		return nil, err
	}
	return publicKey, nil
}

func (s *S3Bucket) deleteObject(bucketName string, objectName string) error {
	// Delete the object from the specified bucket
	_, err := s.client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: &bucketName,
		Key:    &objectName,
	})
	if err != nil {
		return err
	}

	return nil
}

func (s *S3Bucket) listObjects(bucketName string) ([]string, error) {
	// List the objects in the specified bucket
	result, err := s.client.ListObjects(&s3.ListObjectsInput{
		Bucket: &bucketName,
	})
	if err != nil {
		return nil, err
	}

	var objectNames []string
	for _, object := range result.Contents {
		objectNames = append(objectNames, *object.Key)
	}

	return objectNames, nil
}

func parsePublicKeyToBinary(pubKey *rsa.PublicKey) []byte {
	pubASN1 := x509.MarshalPKCS1PublicKey(pubKey)
	pubPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: pubASN1,
	})
	return pubPEM
}

func unmarshalPublicKeyBinary(data []byte) (*rsa.PublicKey, error) {
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the key")
	}

	pubKey, err := x509.ParsePKCS1PublicKey(block.Bytes)
	if err != nil {
		fmt.Printf("failed to parse DER encoded public key: %s", err)
		return nil, err
	}
	return pubKey, nil
}
