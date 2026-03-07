run-api:
	go run ./cmd/api

run-worker:
	go run ./cmd/worker

test:
	go test ./...

build:
	go build ./...
