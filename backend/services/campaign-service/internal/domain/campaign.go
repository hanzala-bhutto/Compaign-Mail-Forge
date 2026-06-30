package domain

import "time"

type CampaignStatus string

const (
	CampaignStatusDraft     CampaignStatus = "draft"
	CampaignStatusScheduled CampaignStatus = "scheduled"
	CampaignStatusSent      CampaignStatus = "sent"
)

type Campaign struct {
	ID         string         `json:"id"`
	Name       string         `json:"name"`
	Subject    string         `json:"subject"`
	Body       string         `json:"body"`
	AudienceID string         `json:"audience_id"`
	Status     CampaignStatus `json:"status"`
	CreatedAt  time.Time      `json:"created_at"`
}
