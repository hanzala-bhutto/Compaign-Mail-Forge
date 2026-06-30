package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"campaign-service/internal/domain"
	"campaign-service/internal/repository"
	"campaign-service/internal/service"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	campaigns *service.CampaignService
}

func NewHandler(campaigns *service.CampaignService) *Handler {
	return &Handler{campaigns: campaigns}
}

func (h *Handler) Router() http.Handler {
	r := chi.NewRouter()
	r.Get("/health", h.health)
	r.Post("/campaigns", h.createCampaign)
	r.Get("/campaigns/{campaignID}", h.getCampaign)
	r.Post("/campaigns/{campaignID}/send", h.sendCampaign)
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

	c, err := h.campaigns.Create(r.Context(), service.CreateCampaignInput{
		Name:       req.Name,
		Subject:    req.Subject,
		Body:       req.Body,
		AudienceID: req.AudienceID,
	})
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, c)
}

func (h *Handler) getCampaign(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "campaignID")
	c, err := h.campaigns.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrCampaignNotFound) {
			writeError(w, http.StatusNotFound, "campaign not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get campaign")
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func (h *Handler) sendCampaign(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "campaignID")
	if err := h.campaigns.Send(r.Context(), id); err != nil {
		if errors.Is(err, repository.ErrCampaignNotFound) {
			writeError(w, http.StatusNotFound, "campaign not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to schedule send")
		return
	}
	writeJSON(w, http.StatusAccepted, map[string]string{"status": "scheduled"})
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// ensure domain import is used for future handlers
var _ domain.CampaignStatus = ""
