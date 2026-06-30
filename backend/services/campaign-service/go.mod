module campaign-service

go 1.23.0

require (
	shared-events v0.0.0
	github.com/go-chi/chi/v5 v5.1.0
	github.com/google/uuid v1.6.0
	github.com/lib/pq v1.10.9
	github.com/twmb/franz-go v1.17.0
)

replace shared-events => ../../shared/events
