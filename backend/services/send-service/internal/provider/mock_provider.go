package provider

import (
	"context"
	"log"
	"time"
)

type MockProvider struct{}

func NewMockProvider() *MockProvider {
	return &MockProvider{}
}

func (p *MockProvider) SendCampaign(ctx context.Context, campaignID string) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-time.After(150 * time.Millisecond):
		log.Printf("mock provider sent campaign=%s", campaignID)
		return nil
	}
}
