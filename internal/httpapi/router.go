package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"email-backend/internal/domain"
	"email-backend/internal/repository"
	"email-backend/internal/service"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	campaigns  *service.CampaignService
	analytics  *service.AnalyticsService
}

func NewHandler(campaigns *service.CampaignService, analytics *service.AnalyticsService) *Handler {
	return &Handler{campaigns: campaigns, analytics: analytics}
}

func (h *Handler) Router() http.Handler {
	r := chi.NewRouter()

	r.Get("/health", h.health)
	r.Post("/campaigns", h.createCampaign)
	r.Get("/campaigns/{campaignID}", h.getCampaign)
	r.Post("/campaigns/{campaignID}/send", h.sendCampaign)
	r.Post("/webhooks/provider", h.providerWebhook)
	r.Get("/analytics/campaigns/{campaignID}", h.getCampaignAnalytics)

	return r
}

func (h *Handler) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

type createCampaignRequest struct {
	Name       string `json:"name"`
	Subject    string `json:"subject"`
	Body       string `json:"body"`
	AudienceID string `json:"audience_id"`
}

func (h *Handler) createCampaign(w http.ResponseWriter, r *http.Request) {
	var req createCampaignRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	campaign, err := h.campaigns.Create(req.Name, req.Subject, req.Body, req.AudienceID)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, campaign)
}

func (h *Handler) getCampaign(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "campaignID")
	c, err := h.campaigns.GetByID(id)
	if err != nil {
		if errors.Is(err, repository.ErrCampaignNotFound) {
			writeError(w, http.StatusNotFound, "campaign not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to read campaign")
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func (h *Handler) sendCampaign(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "campaignID")
	if err := h.campaigns.Send(id); err != nil {
		if errors.Is(err, repository.ErrCampaignNotFound) {
			writeError(w, http.StatusNotFound, "campaign not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to schedule send")
		return
	}
	writeJSON(w, http.StatusAccepted, map[string]string{"status": "scheduled"})
}

func (h *Handler) providerWebhook(w http.ResponseWriter, r *http.Request) {
	var evt domain.ProviderWebhookEvent
	if err := json.NewDecoder(r.Body).Decode(&evt); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if evt.CampaignID == "" || evt.EventType == "" {
		writeError(w, http.StatusBadRequest, "campaign_id and event_type are required")
		return
	}

	h.analytics.IngestEvent(evt)
	writeJSON(w, http.StatusOK, map[string]string{"status": "ingested"})
}

func (h *Handler) getCampaignAnalytics(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "campaignID")
	writeJSON(w, http.StatusOK, h.analytics.GetCampaignAnalytics(id))
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
