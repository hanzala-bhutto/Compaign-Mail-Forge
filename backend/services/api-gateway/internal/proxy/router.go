package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/go-chi/chi/v5"
)

type Router struct {
	campaignURL  *url.URL
	analyticsURL *url.URL
}

func NewRouter(campaignServiceURL, analyticsServiceURL string) (*Router, error) {
	cURL, err := url.Parse(campaignServiceURL)
	if err != nil {
		return nil, err
	}
	aURL, err := url.Parse(analyticsServiceURL)
	if err != nil {
		return nil, err
	}
	return &Router{campaignURL: cURL, analyticsURL: aURL}, nil
}

func (ro *Router) Handler() http.Handler {
	r := chi.NewRouter()

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	r.Mount("/campaigns", httputil.NewSingleHostReverseProxy(ro.campaignURL))
	r.Mount("/analytics", httputil.NewSingleHostReverseProxy(ro.analyticsURL))
	r.Mount("/webhooks", httputil.NewSingleHostReverseProxy(ro.analyticsURL))

	return r
}
