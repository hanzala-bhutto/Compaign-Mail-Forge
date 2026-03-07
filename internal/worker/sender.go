package worker

import (
	"context"
	"encoding/json"
	"log"

	"email-backend/internal/domain"
	"email-backend/internal/provider"
)

type SenderWorker struct {
	provider provider.EmailProvider
}

func NewSenderWorker(provider provider.EmailProvider) *SenderWorker {
	return &SenderWorker{provider: provider}
}

func (w *SenderWorker) HandleMessage(payload []byte) error {
	var evt domain.SendRequestEvent
	if err := json.Unmarshal(payload, &evt); err != nil {
		return err
	}

	if err := w.provider.SendCampaign(context.Background(), evt.CampaignID); err != nil {
		return err
	}

	log.Printf("processed send request campaign=%s", evt.CampaignID)
	return nil
}
