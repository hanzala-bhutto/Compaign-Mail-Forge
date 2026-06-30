CAMPAIGN_DIR  := services/campaign-service
SEND_DIR      := services/send-service
ANALYTICS_DIR := services/analytics-service
GATEWAY_DIR   := services/api-gateway

.PHONY: infra infra-down \
        run-gateway run-campaign run-send run-analytics \
        build test test-integration tidy

# Infrastructure
infra:
	docker compose up -d

infra-down:
	docker compose down -v

# Services
run-gateway:
	cd $(GATEWAY_DIR) && go run ./cmd/server

run-campaign:
	cd $(CAMPAIGN_DIR) && go run ./cmd/server

run-send:
	cd $(SEND_DIR) && go run ./cmd/worker

run-analytics:
	cd $(ANALYTICS_DIR) && go run ./cmd/server

# Build all services
build:
	cd $(CAMPAIGN_DIR)  && go build ./...
	cd $(SEND_DIR)      && go build ./...
	cd $(ANALYTICS_DIR) && go build ./...
	cd $(GATEWAY_DIR)   && go build ./...

# Test all services
test:
	cd $(CAMPAIGN_DIR)  && go test ./...
	cd $(SEND_DIR)      && go test ./...
	cd $(ANALYTICS_DIR) && go test ./...
	cd $(GATEWAY_DIR)   && go test ./...

# Integration tests (requires running infra)
test-integration:
	cd $(CAMPAIGN_DIR)  && go test -tags=integration ./...
	cd $(ANALYTICS_DIR) && go test -tags=integration ./...

# Tidy all go modules
tidy:
	cd shared/events    && go mod tidy
	cd $(CAMPAIGN_DIR)  && go mod tidy
	cd $(SEND_DIR)      && go mod tidy
	cd $(ANALYTICS_DIR) && go mod tidy
	cd $(GATEWAY_DIR)   && go mod tidy
