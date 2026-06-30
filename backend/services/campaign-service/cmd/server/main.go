package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"campaign-service/internal/config"
	"campaign-service/internal/httpapi"
	"campaign-service/internal/kafka"
	"campaign-service/internal/repository"
	"campaign-service/internal/service"
)

func main() {
	cfg := config.Load()

	producer, err := kafka.NewProducer(cfg.KafkaBrokers)
	if err != nil {
		log.Fatalf("kafka producer: %v", err)
	}
	defer producer.Close()

	campaignRepo := repository.NewInMemoryCampaignRepository()
	campaignSvc := service.NewCampaignService(campaignRepo, producer)
	handler := httpapi.NewHandler(campaignSvc)

	srv := &http.Server{
		Addr:    cfg.HTTPAddr,
		Handler: handler.Router(),
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Printf("campaign-service listening on %s", cfg.HTTPAddr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("campaign-service shutting down")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown error: %v", err)
	}
}
