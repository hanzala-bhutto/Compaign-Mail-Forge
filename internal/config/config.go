package config

import "os"

// Config holds runtime settings loaded from environment variables.
type Config struct {
	ServiceName string
	HTTPAddr    string
	NATSURL     string
	EmailTopic  string
}

func Load(serviceName string) Config {
	httpAddr := os.Getenv("HTTP_ADDR")
	if httpAddr == "" {
		httpAddr = ":8080"
	}

	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://127.0.0.1:4222"
	}

	emailTopic := os.Getenv("EMAIL_SEND_TOPIC")
	if emailTopic == "" {
		emailTopic = "email.send.requested"
	}

	return Config{
		ServiceName: serviceName,
		HTTPAddr:    httpAddr,
		NATSURL:     natsURL,
		EmailTopic:  emailTopic,
	}
}
