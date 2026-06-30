# Go Conventions

Review the specified code (or the current file if none given) and enforce the Go conventions used in this project.

## Conventions to Check

### Errors
- Always wrap errors: `fmt.Errorf("doing X: %w", err)` — never `fmt.Errorf("doing X: %v", err)`
- Never swallow errors silently (`_ = someFunc()` is forbidden unless intentional and commented)
- Return errors; do not panic except in `main()` for fatal startup failures
- Sentinel errors use `var ErrXxx = errors.New(...)`, never string comparison

### Context
- `context.Context` is always the **first parameter** of any function that does I/O
- Never store context in a struct field
- Never use `context.Background()` inside a function — only in `main()` or tests
- Pass `ctx` through the call chain; never ignore it

### Interfaces
- Define interfaces in the **consumer** package, not the producer package
- Interface names end in `-er`: `CampaignRepository`, `EventPublisher`, `EmailProvider`
- Keep interfaces small — one or two methods; split if growing
- Never export an interface just to mock it; keep it package-private if only used internally

### Naming
- Packages: lowercase, single word, no underscores (`httpapi` not `http_api`)
- Acronyms: `HTTPAddr`, `NATSURL`, `campaignID` (all caps or all lower, never mixed like `HttpAddr`)
- Unexported fields in structs unless explicitly needed outside the package
- Receiver names: short, consistent per type (`c` for `Campaign`, `r` for repo, `s` for service)

### Functions and Methods
- No naked returns
- No `init()` functions — wire dependencies explicitly in `main()`
- Constructor functions named `NewXxx(deps...) (*Xxx, error)`
- Keep functions short — if it needs a comment to explain what it does, split it

### Structs
- Embed only when genuinely substituting the type, not for convenience
- Use struct tags consistently: `json:"snake_case"` for all exported fields
- No public mutable fields in domain types — use constructors

### Goroutines
- Every goroutine must have a clear owner responsible for waiting on it (`sync.WaitGroup`)
- Never launch a goroutine without a way to stop it (pass `ctx`)
- Use `errgroup.Group` from `golang.org/x/sync/errgroup` for concurrent work with error collection

### Kafka (project-specific)
- Always use `campaignID` as the Kafka message key
- Consumer handlers must be idempotent — the same message may be delivered twice
- Publish result events (`EmailSent` / `EmailFailed`) even on error — never silently drop
- Use `context.Context` cancellation to exit consumer loops cleanly

### Postgres (project-specific)
- Always call `rows.Close()` via `defer` immediately after `db.Query()`
- Always call `rows.Err()` after iterating
- Use `$1, $2` placeholders — never string-format SQL
- Wrap multi-step DB operations in `sql.Tx`

## Output Format

For each violation found:
1. File and line number
2. The rule violated
3. The corrected code snippet

If no violations: confirm "conventions look good" and note any particularly clean patterns worth keeping.
