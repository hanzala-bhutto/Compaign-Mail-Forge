# How it works

Three main flows. Everything else is plumbing.

## Creating a campaign

You `POST /campaigns` with a name, subject, body, and audience ID. The campaign service validates it, generates a UUID, saves it to Postgres, and publishes a `campaign.created` event to Kafka. You get back the campaign with its ID.

Nothing fancy — it's just a write with an event attached.

## Sending a campaign

You `POST /campaigns/{id}/send`. The campaign service publishes a `campaign.send.requested` event and updates the status to "scheduled". That's it — the HTTP response comes back immediately.

Meanwhile, send-service is sitting there consuming from the `campaign.send.requested` topic. It picks up the event, calls the email provider (currently a mock that sleeps 150ms), and publishes either `email.sent` or `email.failed` depending on what happens.

The nice thing here is the API isn't blocked waiting for emails to go out. You could have 10,000 campaigns queued and the API stays fast. Send-service processes them at its own pace.

## Analytics

Two ways events come in:

1. Send-service publishes `email.sent` and `email.failed` to Kafka. Analytics-service consumes them and increments counters.

2. The email provider (SendGrid, SES, whatever) sends webhooks to `POST /webhooks/provider` when things happen — delivered, opened, clicked, bounced. Analytics-service handles those directly, publishes them to Kafka as `provider.webhook.received`, and also writes them to its own Postgres.

When you hit `GET /analytics/campaigns/{id}`, analytics-service queries its DB and gives you counts grouped by event type.

## Why Kafka and not just direct HTTP calls between services

A few reasons that actually matter here:

**Replay** — if analytics-service is down for a few minutes, no events are lost. They stay in the Kafka topic and get consumed when it comes back up.

**Fan-out** — multiple services can consume the same event independently. When the ML service gets added, it can consume `email.sent` to train models without campaign-service or send-service knowing it exists.

**Backpressure** — send-service processes at whatever rate the email provider allows. The queue absorbs spikes.

For a small project, this is overkill. But it's worth understanding how it works at this scale because the pattern doesn't change when you go bigger.
