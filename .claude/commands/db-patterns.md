# DB Patterns

Review or write Postgres code following the patterns used in this project.

## Usage

```
/db-patterns <file-path|service-name>
```

## Rules

### Connection Setup (in main.go only)
```go
func mustOpenPostgres(dsn string) *sql.DB {
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        log.Fatalf("open postgres: %v", err)
    }
    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(5 * time.Minute)
    if err := db.Ping(); err != nil {
        log.Fatalf("ping postgres: %v", err)
    }
    return db
}
```
Always configure the connection pool — the default (unlimited open, unlimited idle) will exhaust connections under load.

### Queries

**Single row:**
```go
func (r *PostgresCampaignRepository) GetByID(id string) (domain.Campaign, error) {
    var c domain.Campaign
    err := r.db.QueryRowContext(ctx, `
        SELECT id, name, subject, body, audience_id, status, created_at
        FROM campaigns WHERE id = $1
    `, id).Scan(&c.ID, &c.Name, &c.Subject, &c.Body, &c.AudienceID, &c.Status, &c.CreatedAt)
    if errors.Is(err, sql.ErrNoRows) {
        return domain.Campaign{}, ErrCampaignNotFound
    }
    return c, err
}
```

**Multiple rows:**
```go
func (r *PostgresRepo) List(ctx context.Context) ([]domain.Campaign, error) {
    rows, err := r.db.QueryContext(ctx, `SELECT id, name FROM campaigns ORDER BY created_at DESC`)
    if err != nil {
        return nil, fmt.Errorf("query campaigns: %w", err)
    }
    defer rows.Close() // ALWAYS immediately after QueryContext

    var results []domain.Campaign
    for rows.Next() {
        var c domain.Campaign
        if err := rows.Scan(&c.ID, &c.Name); err != nil {
            return nil, fmt.Errorf("scan campaign: %w", err)
        }
        results = append(results, c)
    }
    if err := rows.Err(); err != nil { // ALWAYS check rows.Err()
        return nil, fmt.Errorf("rows error: %w", err)
    }
    return results, nil
}
```

**Insert:**
```go
func (r *PostgresCampaignRepository) Create(ctx context.Context, c domain.Campaign) error {
    _, err := r.db.ExecContext(ctx, `
        INSERT INTO campaigns (id, name, subject, body, audience_id, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, c.ID, c.Name, c.Subject, c.Body, c.AudienceID, string(c.Status), c.CreatedAt)
    if err != nil {
        return fmt.Errorf("insert campaign: %w", err)
    }
    return nil
}
```

**Transactions:**
```go
func (r *PostgresRepo) TransferAndLog(ctx context.Context, ...) error {
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return fmt.Errorf("begin tx: %w", err)
    }
    defer tx.Rollback() // no-op if Commit succeeds

    if _, err := tx.ExecContext(ctx, `UPDATE ...`, ...); err != nil {
        return fmt.Errorf("update: %w", err)
    }
    if _, err := tx.ExecContext(ctx, `INSERT INTO logs ...`, ...); err != nil {
        return fmt.Errorf("insert log: %w", err)
    }

    return tx.Commit()
}
```

### Repository Interface Pattern
Interface in `internal/repository/`:
```go
type CampaignRepository interface {
    Create(ctx context.Context, c domain.Campaign) error
    GetByID(ctx context.Context, id string) (domain.Campaign, error)
    Update(ctx context.Context, c domain.Campaign) error
}
```

Two implementations in same package:
- `in_memory_campaign_repository.go` — for local dev without Postgres
- `postgres_campaign_repository.go` — for real use

### Analytics Queries
For event counts, always use `GROUP BY` not multiple queries:
```sql
SELECT event_type, COUNT(*) as count
FROM email_events
WHERE campaign_id = $1
GROUP BY event_type
```
Scan into a `map[string]int64` then build the `CampaignAnalytics` struct.

### Migrations
- One file per migration: `001_init.sql`, `002_add_index.sql`
- Always `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`
- Never `DROP` in a migration without a corresponding down migration
- Migrations auto-run via Docker Compose volume mount at container startup
- For production: use `golang-migrate/migrate` CLI (future phase)

## Common Mistakes to Flag

- `rows.Close()` not deferred immediately after `QueryContext`
- `rows.Err()` not checked after loop
- Using `fmt.Sprintf` to build SQL strings — SQL injection risk
- `SELECT *` — breaks when schema changes, never explicit
- No `context` passed to DB calls — use `QueryContext`/`ExecContext`, never `Query`/`Exec`
- No pool configuration — will exhaust connections
- Not converting domain enums to string for storage (`string(c.Status)`)
