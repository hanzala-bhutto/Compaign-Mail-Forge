package service

import (
	"encoding/json"
	"errors"
	"time"

	"email-backend/internal/domain"
	"email-backend/internal/repository"

	"github.com/google/uuid"
)

type EventPublisher interface {
	Publish(subject string, payload []byte) error
}

type CampaignService struct {
	repo       repository.CampaignRepository
	publisher  EventPublisher
	emailTopic string
}

func NewCampaignService(repo repository.CampaignRepository, publisher EventPublisher, emailTopic string) *CampaignService {
	return &CampaignService{
		repo:       repo,
		publisher:  publisher,
		emailTopic: emailTopic,
	}
}

func (s *CampaignService) Create(name, subject, body, audienceID string) (domain.Campaign, error) {
	if name == "" || subject == "" || audienceID == "" {
		return domain.Campaign{}, errors.New("name, subject, and audience_id are required")
	}

	c := domain.Campaign{
		ID:         uuid.NewString(),
		Name:       name,
		Subject:    subject,
		Body:       body,
		AudienceID: audienceID,
		Status:     domain.CampaignStatusDraft,
		CreatedAt:  time.Now().UTC(),
	}

	if err := s.repo.Create(c); err != nil {
		return domain.Campaign{}, err
	}
	return c, nil
}

func (s *CampaignService) GetByID(id string) (domain.Campaign, error) {
	return s.repo.GetByID(id)
}

func (s *CampaignService) Send(campaignID string) error {
	c, err := s.repo.GetByID(campaignID)
	if err != nil {
		return err
	}

	evt := domain.SendRequestEvent{
		CampaignID:  campaignID,
		RequestedAt: time.Now().UTC(),
	}
	payload, err := json.Marshal(evt)
	if err != nil {
		return err
	}

	if err := s.publisher.Publish(s.emailTopic, payload); err != nil {
		return err
	}

	c.Status = domain.CampaignStatusScheduled
	if err := s.repo.Update(c); err != nil {
		return err
	}
	return nil
}
