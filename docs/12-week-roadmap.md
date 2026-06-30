# Roadmap

Not really 12 weeks. More like "phases" — I move to the next one when the current one feels solid, not on a timer.

## Phase 1 — Get the basics working
- Go fundamentals (done via examples/)
- REST API with chi, in-memory storage
- Async send flow with NATS
- Provider webhook ingestion

**Status: done, being replaced by the microservices rewrite**

## Phase 2 — Microservices + Kafka
Split the monolith into proper services. Each service owns its data. Kafka handles communication between them.

- `shared/events` module — canonical Kafka event schemas
- `campaign-service` — CRUD + publishes events
- `send-service` — consumes send events, calls provider
- `analytics-service` — consumes all events, exposes metrics
- `api-gateway` — routes external traffic
- Replace NATS with Kafka (KRaft, no Zookeeper)
- Postgres per service (replacing in-memory)

## Phase 3 — Frontend
Build the React dashboard so this isn't just a curl-only API.

- Campaign list, create, detail pages
- Analytics charts (open rate, click rate, bounces)
- Send button that actually does something and shows you results
- Shadcn components + Tailwind

## Phase 4 — Real email sending
Swap out the mock provider.

- Integrate SendGrid or AWS SES
- Secure webhook endpoint (verify signatures)
- Handle bounces and unsubscribes properly

## Phase 5 — ML layer
A Python microservice that talks to the Go backend.

- Subject line suggestions using an LLM
- Send-time prediction based on audience engagement history
- Expose as a REST endpoint the frontend can call

## Phase 6 — Observability + deployment
Make it production-ready enough to show.

- Structured logging across all services
- Basic metrics (Prometheus or Azure Monitor)
- GitHub Actions CI
- Deploy to Azure Container Apps
- Benthos pipeline for routing analytics events to a data store
