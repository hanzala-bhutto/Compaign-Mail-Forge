package service

import (
	"context"
	"fmt"

	"analytics-service/internal/domain"
	"analytics-service/internal/repository"
)

type AnalyticsService struct {
	repo repository.AnalyticsRepository
}

func NewAnalyticsService(repo repository.AnalyticsRepository) *AnalyticsService {
	return &AnalyticsService{repo: repo}
}

func (s *AnalyticsService) IngestEvent(ctx context.Context, campaignID, eventType string) error {
	if err := s.repo.Increment(ctx, campaignID, eventType); err != nil {
		return fmt.Errorf("incrementing %s for campaign %s: %w", eventType, campaignID, err)
	}
	return nil
}

func (s *AnalyticsService) GetCampaignAnalytics(ctx context.Context, campaignID string) (domain.CampaignAnalytics, error) {
	a, err := s.repo.Get(ctx, campaignID)
	if err != nil {
		return domain.CampaignAnalytics{}, fmt.Errorf("getting analytics for campaign %s: %w", campaignID, err)
	}
	return a, nil
}
