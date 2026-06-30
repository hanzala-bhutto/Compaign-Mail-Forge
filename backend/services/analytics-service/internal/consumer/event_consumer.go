package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"analytics-service/internal/service"

	"shared-events/events"

	kgo "github.com/twmb/franz-go/pkg/kgo"
)

type EventConsumer struct {
	client  *kgo.Client
	service *service.AnalyticsService
}

func NewEventConsumer(brokers []string, svc *service.AnalyticsService) (*EventConsumer, error) {
	client, err := kgo.NewClient(
		kgo.SeedBrokers(brokers...),
		kgo.ConsumerGroup("analytics-service-group"),
		kgo.ConsumeTopics(
			events.TopicEmailSent,
			events.TopicEmailFailed,
			events.TopicProviderWebhookReceived,
		),
	)
	if err != nil {
		return nil, fmt.Errorf("creating event consumer: %w", err)
	}
	return &EventConsumer{client: client, service: svc}, nil
}

func (c *EventConsumer) Run(ctx context.Context) {
	for {
		fetches := c.client.PollFetches(ctx)
		if fetches.IsClientClosed() {
			return
		}
		fetches.EachError(func(_ string, _ int32, err error) {
			log.Printf("analytics-consumer fetch error: %v", err)
		})
		fetches.EachRecord(func(record *kgo.Record) {
			if err := c.handle(ctx, record); err != nil {
				log.Printf("analytics-consumer handle error topic=%s: %v", record.Topic, err)
			}
		})
	}
}

func (c *EventConsumer) handle(ctx context.Context, record *kgo.Record) error {
	switch record.Topic {
	case events.TopicEmailSent:
		var evt events.EmailSent
		if err := json.Unmarshal(record.Value, &evt); err != nil {
			return fmt.Errorf("unmarshaling email.sent: %w", err)
		}
		return c.service.IngestEvent(ctx, evt.CampaignID, "delivered")

	case events.TopicEmailFailed:
		var evt events.EmailFailed
		if err := json.Unmarshal(record.Value, &evt); err != nil {
			return fmt.Errorf("unmarshaling email.failed: %w", err)
		}
		return c.service.IngestEvent(ctx, evt.CampaignID, "failed")

	case events.TopicProviderWebhookReceived:
		var evt events.ProviderWebhookReceived
		if err := json.Unmarshal(record.Value, &evt); err != nil {
			return fmt.Errorf("unmarshaling provider.webhook.received: %w", err)
		}
		return c.service.IngestEvent(ctx, evt.CampaignID, evt.EventType)
	}

	return nil
}

func (c *EventConsumer) Close() {
	c.client.Close()
}
