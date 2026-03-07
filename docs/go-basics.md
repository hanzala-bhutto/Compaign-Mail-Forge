# Go Basics You Need for This Backend

- Packages: `cmd/` for binaries, `internal/` for app code
- Structs model domain data (`Campaign`, `SendRequestEvent`)
- Interfaces define boundaries (`CampaignRepository`, `EmailProvider`)
- Errors are explicit return values
- Context carries cancellation and deadlines
- Async processing is handled via events and worker subscriptions

Next step: replace in-memory repository with Postgres.
