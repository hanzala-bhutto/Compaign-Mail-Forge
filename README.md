# MailForge

An email campaign platform I'm building to get deep into Go microservices, Kafka, and modern frontend development. The idea is simple — you create email campaigns, send them, and track what happens. But the way it's built is anything but simple.

## What's inside

**Backend** — a set of Go microservices that talk to each other through Kafka. Each service owns its own database, its own logic, and nothing else. No shared state, no shortcuts.

**Frontend** — a React dashboard (Tailwind + Shadcn) where you can manage campaigns and watch analytics come in live.

The stack: Go, Kafka, Postgres, React, Python (for an ML layer eventually), and Azure for deployment.

## Services

| Service | What it does |
|---------|-------------|
| `campaign-service` | Create and manage campaigns |
| `send-service` | Picks up send requests and fires emails |
| `analytics-service` | Tracks opens, clicks, bounces from provider webhooks |
| `api-gateway` | Single entry point — routes everything |

They communicate through Kafka topics. If you hit `/campaigns/{id}/send`, the campaign service publishes an event, send-service picks it up, does its thing, and publishes another event. Analytics-service is listening to all of it.

## Running it

You need Docker for Kafka and Postgres.

```bash
docker compose up -d
```

Then in separate terminals:

```bash
make run-gateway
make run-campaign
make run-send
make run-analytics
```

Frontend:

```bash
cd frontend && npm install && npm run dev
```

Hit `localhost:5173` and you're in.

## Try it with curl

Create a campaign:
```bash
curl -X POST http://localhost:8080/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Summer Drop","subject":"Something you will actually want to read","body":"...","audience_id":"aud-1"}'
```

Send it:
```bash
curl -X POST http://localhost:8080/campaigns/<id>/send
```

Check what happened:
```bash
curl http://localhost:8080/analytics/campaigns/<id>
```

Kafka UI is at `localhost:8082` — you can watch events flow through topics in real time which is pretty satisfying.

## Structure

```
├── services/          # Go microservices
├── frontend/          # React app
├── shared/events/     # Kafka event schemas shared across services
├── database/          # Postgres migrations per service
└── examples/          # Go fundamentals I worked through while building this
```

The `examples/` folder is how I learned Go from scratch while building this — starting from "how do I print something" up through structs and interfaces. It's messy but honest.

## What's next

- Swap mock email provider for a real one (SendGrid or SES)
- Add a Python service that suggests better subject lines using an LLM
- Benthos pipeline for routing analytics events
- Deploy the whole thing to Azure Container Apps
