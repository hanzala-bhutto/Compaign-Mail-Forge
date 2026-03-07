package service

import (
	"email-backend/internal/domain"
	"email-backend/internal/repository"
)

type AnalyticsService struct {
	repo repository.AnalyticsRepository
}

func NewAnalyticsService(repo repository.AnalyticsRepository) *AnalyticsService {
	return &AnalyticsService{repo: repo}
}

func (s *AnalyticsService) IngestEvent(evt domain.ProviderWebhookEvent) {
	s.repo.Increment(evt.CampaignID, evt.EventType)
}

func (s *AnalyticsService) GetCampaignAnalytics(campaignID string) domain.CampaignAnalytics {
	return s.repo.Get(campaignID)
}
