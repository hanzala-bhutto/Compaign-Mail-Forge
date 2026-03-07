package repository

import (
	"errors"
	"sync"

	"email-backend/internal/domain"
)

var ErrCampaignNotFound = errors.New("campaign not found")

type CampaignRepository interface {
	Create(c domain.Campaign) error
	GetByID(id string) (domain.Campaign, error)
	Update(c domain.Campaign) error
}

type InMemoryCampaignRepository struct {
	mu        sync.RWMutex
	campaigns map[string]domain.Campaign
}

func NewInMemoryCampaignRepository() *InMemoryCampaignRepository {
	return &InMemoryCampaignRepository{
		campaigns: make(map[string]domain.Campaign),
	}
}

func (r *InMemoryCampaignRepository) Create(c domain.Campaign) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.campaigns[c.ID] = c
	return nil
}

func (r *InMemoryCampaignRepository) GetByID(id string) (domain.Campaign, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	c, ok := r.campaigns[id]
	if !ok {
		return domain.Campaign{}, ErrCampaignNotFound
	}
	return c, nil
}

func (r *InMemoryCampaignRepository) Update(c domain.Campaign) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.campaigns[c.ID]; !ok {
		return ErrCampaignNotFound
	}
	r.campaigns[c.ID] = c
	return nil
}
