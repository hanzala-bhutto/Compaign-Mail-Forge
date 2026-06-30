# MailForge — Email Campaign Platform

## What This Project Is

A full-stack production-patterned **email campaign platform** with a Go microservices backend and a React frontend. It is both a real working system and a structured learning project targeting the following stack:

- **Go microservices** — one binary per service, own DB per service
- **Kafka (KRaft)** — event bus between all services (replaces NATS)
- **Postgres** — one database per service, raw `database/sql` (no ORM)
- **Benthos** — analytics data pipeline
- **React + Tailwind + Shadcn** — frontend dashboard (built alongside backend)
- **Python + PyTorch + LLMs** — ML microservice for subject line optimization (future)
- **Azure Container Apps** — deployment target (future)

## Monorepo Structure

One repo, two top-level folders — backend and frontend are separated but versioned together.

```
GoLang/
├── backend/
│   ├── services/
│   │   ├── campaign-service/     # CRUD for campaigns; publishes Kafka events
│   │   ├── send-service/         # Consumes send events; calls email provider
│   │   ├── analytics-service/    # Consumes all events; HTTP for metrics + webhooks
│   │   └── api-gateway/          # Thin reverse proxy; single external entry point
│   ├── shared/
│   │   └── events/               # Canonical Kafka event schemas (shared Go module)
│   ├── database/
│   │   └── migrations/
│   │       ├── campaign-service/
│   │       └── analytics-service/
│   ├── docker-compose.yml        # Kafka (KRaft) + dual Postgres
│   ├── go.work                   # Go workspace — ties all modules together
│   └── Makefile                  # Backend orchestration
├── frontend/
│   ├── src/
│   │   ├── components/           # Shadcn + custom components
│   │   ├── pages/                # Route-level page components
│   │   ├── hooks/                # Custom React hooks (TanStack Query)
│   │   ├── lib/                  # API client (api.ts), utils (cn)
│   │   └── types/                # TypeScript types mirroring backend JSON
│   ├── package.json
│   └── vite.config.ts            # Proxies /api → :8080
├── examples/                     # Progressive Go learning examples (01-04)
├── docs/                         # Roadmap and implementation guides
├── CLAUDE.md
└── README.md
```

## Service Ports

| Service               | Port    |
|-----------------------|---------|
| frontend (Vite dev)   | :5173   |
| api-gateway           | :8080   |
| campaign-service      | :8081   |
| analytics-service     | :8083   |
| send-service          | no HTTP |
| Kafka                 | :9092   |
| Kafka UI              | :8082   |
| Postgres (campaign)   | :5432   |
| Postgres (analytics)  | :5433   |

## Kafka Topics

| Topic                      | Producer          | Consumers                          |
|----------------------------|-------------------|------------------------------------|
| campaign.created           | campaign-service  | analytics-service                  |
| campaign.send.requested    | campaign-service  | send-service                       |
| email.sent                 | send-service      | analytics-service                  |
| email.failed               | send-service      | analytics-service                  |
| provider.webhook.received  | analytics-service | (future: ml-service)               |

## Per-Service Structure (canonical pattern)

Every Go service follows this exact layout — do not deviate:

```
services/<name>/
├── go.mod                        # module <name>
├── go.sum
├── cmd/
│   └── server/ or worker/
│       └── main.go               # wires everything; graceful shutdown via signal.NotifyContext
└── internal/
    ├── config/config.go          # reads env vars; no shared config
    ├── domain/<entity>.go        # business structs; no Kafka types here
    ├── repository/               # interface + postgres implementation
    ├── service/                  # business logic; depends on interfaces only
    ├── kafka/
    │   └── producer.go           # franz-go wrapper
    ├── consumer/                 # kafka consumer group loop
    └── httpapi/
        └── router.go             # chi router + handlers
```

## Non-Negotiable Rules

### Backend (Go)
1. **Kafka library**: `github.com/twmb/franz-go` only. Never sarama or confluent-kafka-go.
2. **HTTP router**: `github.com/go-chi/chi/v5` only.
3. **Postgres driver**: `github.com/lib/pq` with `database/sql`. No ORM, no GORM, no sqlx.
4. **No shared packages** beyond `shared/events`. Config, Kafka wiring, repo interfaces — all per-service.
5. **Kafka message key** = `campaignID` always, to preserve per-campaign ordering.
6. **Graceful shutdown** in every main.go via `signal.NotifyContext`.
7. **Error handling**: always wrap with `fmt.Errorf("context: %w", err)`. Never swallow errors.
8. **Context**: always first param, never stored in structs.
9. **Interfaces defined in the consumer package**, not the producer package.
10. **Each service has its own go.mod**; the root has no go.mod. Use `go.work` for IDE support.

### Frontend (React)
11. **Component library**: Shadcn UI only. Never MUI, Chakra, Ant Design.
12. **Styling**: Tailwind CSS only. No inline styles, no CSS modules, no styled-components.
13. **TypeScript**: strict mode always on. No `any`, no `// @ts-ignore`.
14. **Data fetching**: `TanStack Query` (react-query) for all server state. No raw `useEffect` for fetching.
15. **API client**: one central `lib/api.ts` file. Components never call `fetch` directly.
16. **Types**: TypeScript types in `src/types/` mirror backend JSON exactly. No duplication.
17. **State**: server state via TanStack Query; UI state via `useState`/`useReducer`. No Redux.
18. **Routing**: React Router v6 with file-based page components in `src/pages/`.
19. **Forms**: React Hook Form + Zod for validation. No uncontrolled inputs.
20. **No `useEffect` for derived state** — compute from existing state/query data inline.

## Shared Events Module

`shared/events/events.go` is the **contract between all services**. Changing a field is a breaking change. It has zero external dependencies — only stdlib.

## Development Workflow

```bash
# Start infrastructure (from backend/)
cd backend
make infra

# Run services (separate terminals, all from backend/)
make run-gateway
make run-campaign
make run-send
make run-analytics

# Test end-to-end
curl -X POST localhost:8080/campaigns -d '{"name":"Launch","subject":"Welcome","body":"Hello","audience_id":"abc"}'
curl -X POST localhost:8080/campaigns/{id}/send
curl localhost:8080/analytics/campaigns/{id}
```

## Development Workflow — Frontend

```bash
cd frontend
npm install
npm run dev       # starts on :5173, proxies /api/* to api-gateway :8080
```

The Vite config proxies all `/api` requests to `localhost:8080` so the frontend talks to the real backend during development. No mocking needed.

## Skills Available

### Backend
- `/go-conventions` — Go idioms and patterns enforced in this project
- `/new-service` — scaffold a new microservice following the canonical structure
- `/code-review` — project-aware code review (Kafka, microservices, Postgres patterns)
- `/test-strategy` — testing patterns for Go microservices
- `/db-patterns` — Postgres + database/sql patterns

### Frontend
- `/frontend-conventions` — React + Tailwind + Shadcn patterns enforced in this project
- `/new-component` — scaffold a new page or component following the canonical structure

## Examples (Learning Path)

The `examples/` directory contains standalone Go programs (01-run through 04-structs) that teach Go fundamentals using the same domain as the real backend. Run with `go run ./examples/0X`.
