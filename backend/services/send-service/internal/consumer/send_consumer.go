package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"send-service/internal/kafka"
	"send-service/internal/provider"

	"shared-events/events"

	"github.com/google/uuid"
	kgo "github.com/twmb/franz-go/pkg/kgo"
)

type SendConsumer struct {
	client   *kgo.Client
	producer *kafka.Producer
	provider provider.EmailProvider
}

func NewSendConsumer(brokers []string, producer *kafka.Producer, prov provider.EmailProvider) (*SendConsumer, error) {
	client, err := kgo.NewClient(
		kgo.SeedBrokers(brokers...),
		kgo.ConsumerGroup("send-service-group"),
		kgo.ConsumeTopics(events.TopicCampaignSendRequested),
	)
	if err != nil {
		return nil, fmt.Errorf("creating send consumer: %w", err)
	}
	return &SendConsumer{client: client, producer: producer, provider: prov}, nil
}

func (c *SendConsumer) Run(ctx context.Context) {
	for {
		fetches := c.client.PollFetches(ctx)
		if fetches.IsClientClosed() {
			return
		}
		fetches.EachError(func(_ string, _ int32, err error) {
			log.Printf("send-consumer fetch error: %v", err)
		})
		fetches.EachRecord(func(record *kgo.Record) {
			if err := c.handle(ctx, record); err != nil {
				log.Printf("send-consumer handle error campaign_id=%s: %v", record.Key, err)
			}
		})
	}
}

func (c *SendConsumer) handle(ctx context.Context, record *kgo.Record) error {
	var evt events.CampaignSendRequested
	if err := json.Unmarshal(record.Value, &evt); err != nil {
		return fmt.Errorf("unmarshaling event: %w", err)
	}

	err := c.provider.SendCampaign(ctx, evt.CampaignID)
	if err != nil {
		failed := events.EmailFailed{
			CampaignID: evt.CampaignID,
			Reason:     err.Error(),
			OccurredAt: time.Now().UTC(),
		}
		return c.producer.Publish(ctx, events.TopicEmailFailed, evt.CampaignID, failed)
	}

	sent := events.EmailSent{
		CampaignID:        evt.CampaignID,
		ProviderMessageID: uuid.NewString(),
		OccurredAt:        time.Now().UTC(),
	}
	return c.producer.Publish(ctx, events.TopicEmailSent, evt.CampaignID, sent)
}

func (c *SendConsumer) Close() {
	c.client.Close()
}
