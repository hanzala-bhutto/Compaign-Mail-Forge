package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"send-service/internal/config"
	"send-service/internal/consumer"
	"send-service/internal/kafka"
	"send-service/internal/provider"
)

func main() {
	cfg := config.Load()

	producer, err := kafka.NewProducer(cfg.KafkaBrokers)
	if err != nil {
		log.Fatalf("kafka producer: %v", err)
	}
	defer producer.Close()

	c, err := consumer.NewSendConsumer(cfg.KafkaBrokers, producer, provider.NewMockProvider())
	if err != nil {
		log.Fatalf("send consumer: %v", err)
	}
	defer c.Close()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	log.Println("send-service started")
	c.Run(ctx)
	log.Println("send-service stopped")
}
