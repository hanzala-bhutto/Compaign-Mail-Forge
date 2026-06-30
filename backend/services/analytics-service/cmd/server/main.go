package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"analytics-service/internal/config"
	"analytics-service/internal/consumer"
	"analytics-service/internal/httpapi"
	"analytics-service/internal/kafka"
	"analytics-service/internal/repository"
	"analytics-service/internal/service"
)

func main() {
	cfg := config.Load()

	producer, err := kafka.NewProducer(cfg.KafkaBrokers)
	if err != nil {
		log.Fatalf("kafka producer: %v", err)
	}
	defer producer.Close()

	analyticsRepo := repository.NewInMemoryAnalyticsRepository()
	analyticsSvc := service.NewAnalyticsService(analyticsRepo)

	eventConsumer, err := consumer.NewEventConsumer(cfg.KafkaBrokers, analyticsSvc)
	if err != nil {
		log.Fatalf("event consumer: %v", err)
	}
	defer eventConsumer.Close()

	handler := httpapi.NewHandler(analyticsSvc, producer)
	srv := &http.Server{
		Addr:    cfg.HTTPAddr,
		Handler: handler.Router(),
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		log.Printf("analytics-service listening on %s", cfg.HTTPAddr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	go func() {
		defer wg.Done()
		log.Println("analytics-service consumer started")
		eventConsumer.Run(ctx)
	}()

	<-ctx.Done()
	log.Println("analytics-service shutting down")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown error: %v", err)
	}

	wg.Wait()
}
