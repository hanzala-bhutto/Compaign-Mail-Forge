package provider

import "context"

type EmailProvider interface {
	SendCampaign(ctx context.Context, campaignID string) error
}
