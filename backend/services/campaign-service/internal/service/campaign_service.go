package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"campaign-service/internal/domain"
	"campaign-service/internal/repository"

	"shared-events/events"

	"github.com/google/uuid"
)

type EventPublisher interface {
	Publish(ctx context.Context, topic string, key string, v any) error
}

type CampaignService struct {
	repo      repository.CampaignRepository
	publisher EventPublisher
}

func NewCampaignService(repo repository.CampaignRepository, publisher EventPublisher) *CampaignService {
	return &CampaignService{repo: repo, publisher: publisher}
}

type CreateCampaignInput struct {
	Name       string
	Subject    string
	Body       string
	AudienceID string
}

func (s *CampaignService) Create(ctx context.Context, input CreateCampaignInput) (domain.Campaign, error) {
	if input.Name == "" || input.Subject == "" || input.AudienceID == "" {
		return domain.Campaign{}, errors.New("name, subject, and audience_id are required")
	}

	c := domain.Campaign{
		ID:         uuid.NewString(),
		Name:       input.Name,
		Subject:    input.Subject,
		Body:       input.Body,
		AudienceID: input.AudienceID,
		Status:     domain.CampaignStatusDraft,
		CreatedAt:  time.Now().UTC(),
	}

	if err := s.repo.Create(ctx, c); err != nil {
		return domain.Campaign{}, fmt.Errorf("creating campaign: %w", err)
	}

	evt := events.CampaignCreated{
		CampaignID: c.ID,
		Name:       c.Name,
		Subject:    c.Subject,
		AudienceID: c.AudienceID,
		OccurredAt: c.CreatedAt,
	}
	if err := s.publisher.Publish(ctx, events.TopicCampaignCreated, c.ID, evt); err != nil {
		return domain.Campaign{}, fmt.Errorf("publishing campaign.created: %w", err)
	}

	return c, nil
}

func (s *CampaignService) GetByID(ctx context.Context, id string) (domain.Campaign, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.Campaign{}, fmt.Errorf("getting campaign %s: %w", id, err)
	}
	return c, nil
}

func (s *CampaignService) Send(ctx context.Context, campaignID string) error {
	c, err := s.repo.GetByID(ctx, campaignID)
	if err != nil {
		return fmt.Errorf("getting campaign %s: %w", campaignID, err)
	}

	evt := events.CampaignSendRequested{
		CampaignID:  campaignID,
		RequestedAt: time.Now().UTC(),
	}
	if err := s.publisher.Publish(ctx, events.TopicCampaignSendRequested, campaignID, evt); err != nil {
		return fmt.Errorf("publishing campaign.send.requested: %w", err)
	}

	c.Status = domain.CampaignStatusScheduled
	if err := s.repo.Update(ctx, c); err != nil {
		return fmt.Errorf("updating campaign status: %w", err)
	}
	return nil
}
