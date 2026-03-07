package repository

import (
	"sync"

	"email-backend/internal/domain"
)

type AnalyticsRepository interface {
	Increment(campaignID, eventType string)
	Get(campaignID string) domain.CampaignAnalytics
}

type InMemoryAnalyticsRepository struct {
	mu    sync.RWMutex
	stats map[string]domain.CampaignAnalytics
}

func NewInMemoryAnalyticsRepository() *InMemoryAnalyticsRepository {
	return &InMemoryAnalyticsRepository{
		stats: make(map[string]domain.CampaignAnalytics),
	}
}

func (r *InMemoryAnalyticsRepository) Increment(campaignID, eventType string) {
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
	}

	r.stats[campaignID] = v
}

func (r *InMemoryAnalyticsRepository) Get(campaignID string) domain.CampaignAnalytics {
	r.mu.RLock()
	defer r.mu.RUnlock()
	v, ok := r.stats[campaignID]
	if !ok {
		return domain.CampaignAnalytics{CampaignID: campaignID}
	}
	return v
}
