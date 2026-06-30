package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"analytics-service/internal/kafka"
	"analytics-service/internal/service"

	"shared-events/events"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	analytics *service.AnalyticsService
	producer  *kafka.Producer
}

func NewHandler(analytics *service.AnalyticsService, producer *kafka.Producer) *Handler {
	return &Handler{analytics: analytics, producer: producer}
}

func (h *Handler) Router() http.Handler {
	r := chi.NewRouter()
	r.Get("/health", h.health)
	r.Post("/webhooks/provider", h.providerWebhook)
	r.Get("/analytics/campaigns/{campaignID}", h.getCampaignAnalytics)
	return r
}

func (h *Handler) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

type webhookRequest struct {
	CampaignID string `json:"campaign_id"`
	EventType  string `json:"event_type"`
}

func (h *Handler) providerWebhook(w http.ResponseWriter, r *http.Request) {
	var req webhookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if req.CampaignID == "" || req.EventType == "" {
		writeError(w, http.StatusBadRequest, "campaign_id and event_type are required")
		return
	}

	evt := events.ProviderWebhookReceived{
		CampaignID: req.CampaignID,
		EventType:  req.EventType,
		OccurredAt: time.Now().UTC(),
	}
	if err := h.producer.Publish(r.Context(), events.TopicProviderWebhookReceived, req.CampaignID, evt); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to publish event")
		return
	}

	if err := h.analytics.IngestEvent(r.Context(), req.CampaignID, req.EventType); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to ingest event")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "ingested"})
}

func (h *Handler) getCampaignAnalytics(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "campaignID")
	a, err := h.analytics.GetCampaignAnalytics(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get analytics")
		return
	}
	writeJSON(w, http.StatusOK, a)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
