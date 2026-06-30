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
		HTTPAddr:     getEnv("HTTP_ADDR", ":8083"),
		PostgresDSN:  getEnv("POSTGRES_DSN", "host=localhost port=5433 user=analytics_user password=analytics_pass dbname=analytics_db sslmode=disable"),
		KafkaBrokers: strings.Split(brokers, ","),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
