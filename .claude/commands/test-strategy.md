# Test Strategy

Write or review tests for the specified service or file following this project's testing patterns.

## Usage

```
/test-strategy <service-name|file-path>
```

## Testing Layers

### 1. Unit Tests (always present)
Test business logic in isolation. No real Kafka, no real Postgres, no real HTTP.

**What to test:**
- `internal/service/` — all public methods
- `internal/domain/` — any non-trivial validation logic

**Pattern — table-driven tests (mandatory for Go):**
```go
func TestCampaignService_Create(t *testing.T) {
    tests := []struct {
        name    string
        input   CreateCampaignInput
        wantErr bool
    }{
        {"valid input", CreateCampaignInput{Name: "Launch", Subject: "Hi"}, false},
        {"empty name",  CreateCampaignInput{Name: "", Subject: "Hi"},     true},
    }
    for _, tc := range tests {
        t.Run(tc.name, func(t *testing.T) {
            svc := service.NewCampaignService(
                &fakeCampaignRepo{},
                &fakeEventPublisher{},
            )
            _, err := svc.Create(context.Background(), tc.input)
            if (err != nil) != tc.wantErr {
                t.Errorf("got err=%v, wantErr=%v", err, tc.wantErr)
            }
        })
    }
}
```

**Fakes over mocks:**
Use hand-written fakes, not `gomock` or `testify/mock`. Fakes are simpler, more readable, and don't break on refactors:
```go
type fakeCampaignRepo struct {
    campaigns map[string]domain.Campaign
    err       error // set to simulate failure
}

func (f *fakeCampaignRepo) Create(c domain.Campaign) error {
    if f.err != nil { return f.err }
    if f.campaigns == nil { f.campaigns = make(map[string]domain.Campaign) }
    f.campaigns[c.ID] = c
    return nil
}
```

### 2. Integration Tests (per service, behind build tag)
Test the full stack: real Postgres, real Kafka. These run in CI with Docker.

**Build tag — always use this header:**
```go
//go:build integration

package repository_test
```

Run with: `go test -tags=integration ./...`

**Postgres integration test pattern:**
```go
func TestPostgresCampaignRepository_Create(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping integration test")
    }
    db := mustOpenTestDB(t) // connects to test Postgres; t.Cleanup closes it
    repo := repository.NewPostgresCampaignRepository(db)

    c := domain.Campaign{ID: uuid.NewString(), Name: "Test", ...}
    err := repo.Create(c)
    if err != nil {
        t.Fatalf("Create: %v", err)
    }

    got, err := repo.GetByID(c.ID)
    if err != nil || got.Name != c.Name {
        t.Errorf("GetByID: got %v, err %v", got, err)
    }
}

func mustOpenTestDB(t *testing.T) *sql.DB {
    t.Helper()
    dsn := os.Getenv("TEST_POSTGRES_DSN")
    if dsn == "" {
        t.Skip("TEST_POSTGRES_DSN not set")
    }
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        t.Fatalf("open db: %v", err)
    }
    t.Cleanup(func() { db.Close() })
    return db
}
```

**Kafka consumer integration test pattern:**
Use an in-process Kafka producer to seed the topic, then run the consumer handler directly:
```go
func TestSendConsumer_Handle(t *testing.T) {
    // Don't test the Kafka polling loop — test the handler function directly
    consumer := &SendConsumer{provider: &fakeProvider{}}
    record := &kgo.Record{
        Value: mustMarshal(events.CampaignSendRequested{CampaignID: "abc"}),
        Key:   []byte("abc"),
    }
    err := consumer.handle(context.Background(), record)
    if err != nil {
        t.Fatalf("handle: %v", err)
    }
}
```

### 3. HTTP Handler Tests (net/http/httptest)
Test HTTP layer without running a real server:
```go
func TestHandler_CreateCampaign(t *testing.T) {
    svc := &fakeCampaignService{}
    h := httpapi.NewHandler(svc)

    body := `{"name":"Launch","subject":"Hi","body":"Hello","audience_id":"xyz"}`
    req := httptest.NewRequest(http.MethodPost, "/campaigns", strings.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()

    h.Router().ServeHTTP(w, req)

    if w.Code != http.StatusCreated {
        t.Errorf("got %d, want 201", w.Code)
    }
}
```

## What NOT to Test

- `main.go` wiring — too much setup, low value
- `config.go` env var reading — trivial
- The Kafka polling loop itself — test the handler function it calls
- Third-party library behavior (franz-go, chi)

## File Naming

- Unit tests: `<file>_test.go` in same package (`package service`)
- Integration tests: `<file>_integration_test.go` with `//go:build integration`
- Black-box tests: `package service_test` (tests public API only)

## When Writing Tests for Existing Code

1. Read the file being tested first
2. Identify all code paths (happy path + each error branch)
3. Write one table-driven test function per public method
4. Add a fake for each interface the subject depends on
5. Run `go test ./...` and confirm all pass before finishing
