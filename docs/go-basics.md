# Go concepts that actually matter for this codebase

Not a tutorial. Just the things I kept running into while building this that were worth understanding properly.

## Packages

Two folders you'll see everywhere: `cmd/` and `internal/`.

`cmd/` is where binaries live. Each subfolder is a runnable program — `cmd/server/main.go` is what you actually execute. Keep these thin. Just wire things together and start the server.

`internal/` is where the actual code lives. Go enforces that nothing outside this module can import from `internal/`. Good for keeping service boundaries real.

## Structs and interfaces

Structs are just data. `Campaign` is a struct — it holds a name, subject, status, and so on.

Interfaces are where Go gets interesting. A `CampaignRepository` interface says "anything that can create and retrieve campaigns". The in-memory repo implements it. The Postgres repo implements it. The service layer doesn't care which one it gets — it just calls the methods.

This is what makes testing clean. You pass a fake repo in tests, the real one in production.

## Errors

Go errors are just values you return. No exceptions. Every function that can fail returns `(something, error)`.

The pattern that matters: always wrap with context.

```go
// bad — what file? what operation?
return err

// good
return fmt.Errorf("getting campaign %s: %w", id, err)
```

The `%w` means the original error is still accessible with `errors.Is()` and `errors.As()`. The string around it tells you where things went wrong without reading a stack trace.

## Context

`context.Context` is the first parameter of basically every function that does I/O. It carries two things: a deadline (when to give up) and a cancellation signal (someone above you already gave up, stop working).

```go
func (s *CampaignService) GetByID(ctx context.Context, id string) (Campaign, error) {
    return s.repo.GetByID(ctx, id)
}
```

Pass it through. Don't store it in a struct. Don't ignore it.

When you see `signal.NotifyContext` in `main.go`, that's creating a context that cancels when the process gets a SIGTERM — so everything downstream knows to stop cleanly.

## Goroutines and the worker pattern

A goroutine is just `go someFunc()`. Cheap to create, runs concurrently.

The pattern in this codebase: the Kafka consumer runs in a goroutine, blocking on `PollFetches`. When the context cancels (SIGTERM), `PollFetches` returns and the loop exits. Clean shutdown without killing anything mid-flight.

```go
go func() {
    defer wg.Done()
    consumer.Run(ctx) // blocks until ctx is cancelled
}()
```

`sync.WaitGroup` makes sure you don't exit `main()` before goroutines finish.

## What to read next

If any of this is still fuzzy, the examples in `examples/01` through `examples/04` are short programs you can run and poke at. Start there, then come back to the actual service code.
