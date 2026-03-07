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

type SendRequestEvent struct {
	CampaignID string    `json:"campaign_id"`
	RequestedAt time.Time `json:"requested_at"`
}

type ProviderWebhookEvent struct {
	CampaignID string `json:"campaign_id"`
	EventType  string `json:"event_type"`
}

type CampaignAnalytics struct {
	CampaignID string `json:"campaign_id"`
	Delivered  int64  `json:"delivered"`
	Opened     int64  `json:"opened"`
	Clicked    int64  `json:"clicked"`
	Bounced    int64  `json:"bounced"`
}
