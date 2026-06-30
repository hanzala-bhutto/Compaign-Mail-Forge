package events

import "time"

const (
	TopicCampaignCreated         = "campaign.created"
	TopicCampaignSendRequested   = "campaign.send.requested"
	TopicEmailSent               = "email.sent"
	TopicEmailFailed             = "email.failed"
	TopicProviderWebhookReceived = "provider.webhook.received"
)

type CampaignCreated struct {
	CampaignID string    `json:"campaign_id"`
	Name       string    `json:"name"`
	Subject    string    `json:"subject"`
	AudienceID string    `json:"audience_id"`
	OccurredAt time.Time `json:"occurred_at"`
}

type CampaignSendRequested struct {
	CampaignID  string    `json:"campaign_id"`
	RequestedAt time.Time `json:"requested_at"`
}

type EmailSent struct {
	CampaignID        string    `json:"campaign_id"`
	ProviderMessageID string    `json:"provider_message_id"`
	OccurredAt        time.Time `json:"occurred_at"`
}

type EmailFailed struct {
	CampaignID string    `json:"campaign_id"`
	Reason     string    `json:"reason"`
	OccurredAt time.Time `json:"occurred_at"`
}

type ProviderWebhookReceived struct {
	CampaignID string    `json:"campaign_id"`
	EventType  string    `json:"event_type"` // delivered, open, click, bounce
	OccurredAt time.Time `json:"occurred_at"`
}
