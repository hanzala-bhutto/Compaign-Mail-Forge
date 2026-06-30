package repository

import (
	"context"
	"errors"
	"sync"

	"campaign-service/internal/domain"
)

var ErrCampaignNotFound = errors.New("campaign not found")

type CampaignRepository interface {
	Create(ctx context.Context, c domain.Campaign) error
	GetByID(ctx context.Context, id string) (domain.Campaign, error)
	Update(ctx context.Context, c domain.Campaign) error
}

type InMemoryCampaignRepository struct {
	mu        sync.RWMutex
	campaigns map[string]domain.Campaign
}

func NewInMemoryCampaignRepository() *InMemoryCampaignRepository {
	return &InMemoryCampaignRepository{campaigns: make(map[string]domain.Campaign)}
}

func (r *InMemoryCampaignRepository) Create(_ context.Context, c domain.Campaign) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.campaigns[c.ID] = c
	return nil
}

func (r *InMemoryCampaignRepository) GetByID(_ context.Context, id string) (domain.Campaign, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	c, ok := r.campaigns[id]
	if !ok {
		return domain.Campaign{}, ErrCampaignNotFound
	}
	return c, nil
}

func (r *InMemoryCampaignRepository) Update(_ context.Context, c domain.Campaign) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.campaigns[c.ID]; !ok {
		return ErrCampaignNotFound
	}
	r.campaigns[c.ID] = c
	return nil
}
