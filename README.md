# Email Backend in Go (Teaching + Production Starter)

This repository is a hands-on learning path and starter backend aligned to your target backend role.

## What You Will Build

- REST APIs for campaigns and analytics
- Async email send workflow via NATS
- Worker service for high-throughput processing
- Provider webhook ingestion (delivered/open/click/bounce)

## Quick Start

1. `docker compose up -d nats`
2. `go run ./cmd/api`
3. `go run ./cmd/worker`
4. Use API examples in this file.

## API Examples

Create campaign:

```bash
curl -X POST http://localhost:8080/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Launch","subject":"Hello","body":"Welcome!","audience_id":"aud-1"}'
```

Schedule send:

```bash
curl -X POST http://localhost:8080/campaigns/<CAMPAIGN_ID>/send
```

Ingest webhook:

```bash
curl -X POST http://localhost:8080/webhooks/provider \
  -H "Content-Type: application/json" \
  -d '{"campaign_id":"<CAMPAIGN_ID>","event_type":"delivered"}'
```

Read analytics:

```bash
curl http://localhost:8080/analytics/campaigns/<CAMPAIGN_ID>
```
