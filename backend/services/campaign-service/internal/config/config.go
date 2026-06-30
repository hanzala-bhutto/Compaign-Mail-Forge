package config

import (
	"os"
	"strings"
)

type Config struct {
	HTTPAddr     string
	PostgresDSN  string
	KafkaBrokers []string
}

func Load() Config {
	brokers := os.Getenv("KAFKA_BROKERS")
	if brokers == "" {
		brokers = "localhost:9092"
	}
	return Config{
		HTTPAddr:     getEnv("HTTP_ADDR", ":8081"),
		PostgresDSN:  getEnv("POSTGRES_DSN", "host=localhost port=5432 user=campaign_user password=campaign_pass dbname=campaign_db sslmode=disable"),
		KafkaBrokers: strings.Split(brokers, ","),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
