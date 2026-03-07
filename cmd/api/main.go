package main

import (
	"log"
	"net/http"

	"email-backend/internal/config"
	"email-backend/internal/httpapi"
	"email-backend/internal/messaging"
	"email-backend/internal/repository"
	"email-backend/internal/service"
)

func main() {
	cfg := config.Load("api")

	natsClient, err := messaging.NewNATSClient(cfg.NATSURL)
	if err != nil {
		log.Fatalf("failed to connect NATS: %v", err)
	}

	campaignRepo := repository.NewInMemoryCampaignRepository()
	analyticsRepo := repository.NewInMemoryAnalyticsRepository()

	campaignService := service.NewCampaignService(campaignRepo, natsClient, cfg.EmailTopic)
	analyticsService := service.NewAnalyticsService(analyticsRepo)

	h := httpapi.NewHandler(campaignService, analyticsService)

	log.Printf("api listening on %s", cfg.HTTPAddr)
	if err := http.ListenAndServe(cfg.HTTPAddr, h.Router()); err != nil {
		log.Fatalf("api stopped: %v", err)
	}
}
