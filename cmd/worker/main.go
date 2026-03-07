package main

import (
	"log"
	"time"

	"email-backend/internal/config"
	"email-backend/internal/messaging"
	"email-backend/internal/provider"
	"email-backend/internal/worker"
)

func main() {
	cfg := config.Load("worker")

	natsClient, err := messaging.NewNATSClient(cfg.NATSURL)
	if err != nil {
		log.Fatalf("failed to connect NATS: %v", err)
	}

	sender := worker.NewSenderWorker(provider.NewMockProvider())
	_, err = natsClient.Subscribe(cfg.EmailTopic, sender.HandleMessage)
	if err != nil {
		log.Fatalf("failed to subscribe: %v", err)
	}

	log.Printf("worker subscribed topic=%s", cfg.EmailTopic)
	for {
		time.Sleep(5 * time.Second)
	}
}
