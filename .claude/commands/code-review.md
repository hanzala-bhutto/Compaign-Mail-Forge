# Code Review

Review the current branch diff (or a specified file/service) for correctness, architecture adherence, and Go quality issues specific to this project.

## Usage

```
/code-review [service-name|file-path] [--fix]
```

- No args: reviews the full `git diff main` output
- `--fix`: applies fixes after reporting

## Review Checklist

### Architecture (highest priority)
- [ ] No business logic in `main.go` — only wiring and startup
- [ ] No shared packages created outside `shared/events`
- [ ] Services do not import each other's packages
- [ ] Kafka event types only come from `shared/events`, never redefined locally
- [ ] Each service has its own `go.mod` — no cross-module implicit imports
- [ ] HTTP handlers do not contain SQL or Kafka calls — they delegate to service layer
- [ ] Service layer does not import `net/http` or Kafka packages — only interfaces

### Kafka Correctness
- [ ] All producers use `campaignID` as message key
- [ ] Consumer handlers are idempotent (safe to run twice on same message)
- [ ] Consumer loop exits cleanly on `ctx.Done()`
- [ ] `EmailFailed` is published on provider error — not just logged
- [ ] No `time.Sleep` retry loops — use Kafka consumer group retry semantics
- [ ] Consumer group name is unique per service (`<service-name>-group`)

### Postgres / database/sql
- [ ] `rows.Close()` deferred immediately after `db.Query()`
- [ ] `rows.Err()` checked after loop
- [ ] No string-formatted SQL — only `$1, $2` placeholders
- [ ] Transactions used for multi-step writes
- [ ] Connection pool settings configured (MaxOpenConns, MaxIdleConns, ConnMaxLifetime)
- [ ] No `SELECT *` — always name columns explicitly

### Go Conventions (see /go-conventions)
- [ ] Errors wrapped with `%w`, not `%v`
- [ ] No swallowed errors
- [ ] Context as first param on all I/O functions
- [ ] No context stored in structs
- [ ] Interfaces defined in consumer package
- [ ] No `init()` functions
- [ ] Goroutines have owners and exit conditions

### Security
- [ ] No secrets in code or config defaults that look like real credentials
- [ ] SQL injection impossible (parameterized queries only)
- [ ] No user input directly concatenated into any string used as an identifier
- [ ] HTTP handlers validate and bound-check input before passing to service

### Observability (flag missing, don't require yet)
- [ ] Structured log lines include `campaign_id` where relevant
- [ ] Errors logged at the point they are handled, not re-logged at every layer

## Output Format

Group findings by severity:

**BLOCKER** — must fix before merge (wrong behavior, data loss, security issue)
**WARN** — should fix (convention violation, missing error check)
**SUGGEST** — optional improvement (readability, naming)

For each finding:
- File path and line number
- What is wrong
- Corrected code snippet (for BLOCKER and WARN)

End with a summary: X blockers, Y warnings, Z suggestions.
