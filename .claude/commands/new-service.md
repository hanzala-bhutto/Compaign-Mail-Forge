# New Service

Scaffold a new Go microservice following the canonical structure for this project.

## Usage

```
/new-service <service-name> [--http] [--consumer <topic>] [--producer <topic>]
```

Examples:
- `/new-service notification-service --http --consumer email.sent`
- `/new-service ml-service --http --producer ml.prediction.ready`

## What Gets Created

Given `<service-name>` (e.g. `notification-service`), create the following files:

### 1. `services/<service-name>/go.mod`
```
module <service-name>

go 1.23.0

require (
    shared-events v0.0.0
    github.com/twmb/franz-go v1.17.0
    github.com/google/uuid v1.6.0
    // add github.com/go-chi/chi/v5 v5.1.0 if --http
    // add github.com/lib/pq v1.10.9 if postgres needed
)

replace shared-events => ../../shared/events
```

### 2. `services/<service-name>/internal/config/config.go`
Load from env vars with sensible defaults:
- `HTTP_ADDR` → `:808X` (pick next available port from CLAUDE.md)
- `KAFKA_BROKERS` → `localhost:9092`
- `POSTGRES_DSN` → only if service needs a DB
No shared config — every service owns its own.

### 3. `services/<service-name>/internal/domain/<entity>.go`
Domain structs for this service's bounded context only.
No Kafka event types here — those live in `shared/events`.

### 4. `services/<service-name>/internal/kafka/producer.go`
Standard franz-go producer wrapper (copy pattern from campaign-service).

### 5. `services/<service-name>/internal/consumer/<topic>_consumer.go` (if --consumer)
Consumer group loop using `kgo.ConsumerGroup` and `kgo.ConsumeTopics`.
Include a `handle(ctx, record)` method that:
- Unmarshals the event from `shared/events`
- Calls the service layer
- Returns error (never panics)

### 6. `services/<service-name>/internal/httpapi/router.go` (if --http)
Chi router with:
- `GET /health` returning `{"status":"ok"}`
- Placeholder routes for this service's endpoints

### 7. `services/<service-name>/cmd/server/main.go` or `cmd/worker/main.go`
Wire all dependencies. Always include:
```go
ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
defer stop()
```
For services with both HTTP and a consumer, run both in goroutines under the same ctx with sync.WaitGroup.

### 8. Database migration (if DB needed)
`database/migrations/<service-name>/001_init.sql`

## After Scaffolding

1. Add the service to `docker-compose.yml` Postgres section if it needs a DB
2. Add `make run-<service-name>` target to the root `Makefile`
3. Add the module to `go.work` at the repo root
4. Add the port to the service port table in `CLAUDE.md`
5. Add any new Kafka topics to the topics table in `CLAUDE.md`

## Rules

- Never put business logic in `main.go` — only wiring
- Never share config, repos, or Kafka clients between services
- The new service must compile with `go build ./...` before considering it done
- Follow `/go-conventions` for all generated code
