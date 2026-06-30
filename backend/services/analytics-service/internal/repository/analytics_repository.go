package repository

import (
	"context"
	"sync"

	"analytics-service/internal/domain"
)

type AnalyticsRepository interface {
	Increment(ctx context.Context, campaignID, eventType string) error
	Get(ctx context.Context, campaignID string) (domain.CampaignAnalytics, error)
}

type InMemoryAnalyticsRepository struct {
	mu    sync.RWMutex
	stats map[string]domain.CampaignAnalytics
}

func NewInMemoryAnalyticsRepository() *InMemoryAnalyticsRepository {
	return &InMemoryAnalyticsRepository{stats: make(map[string]domain.CampaignAnalytics)}
}

func (r *InMemoryAnalyticsRepository) Increment(_ context.Context, campaignID, eventType string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	v := r.stats[campaignID]
	v.CampaignID = campaignID

	switch eventType {
	case "delivered":
		v.Delivered++
	case "open":
		v.Opened++
	case "click":
		v.Clicked++
	case "bounce":
		v.Bounced++
	case "failed":
		v.Failed++
	}

	r.stats[campaignID] = v
	return nil
}

func (r *InMemoryAnalyticsRepository) Get(_ context.Context, campaignID string) (domain.CampaignAnalytics, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	v, ok := r.stats[campaignID]
	if !ok {
		return domain.CampaignAnalytics{CampaignID: campaignID}, nil
	}
	return v, nil
}
