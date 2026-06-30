package config

import "os"

type Config struct {
	HTTPAddr        string
	CampaignService string
	AnalyticsService string
}

func Load() Config {
	return Config{
		HTTPAddr:         getEnv("HTTP_ADDR", ":8080"),
		CampaignService:  getEnv("CAMPAIGN_SERVICE_URL", "http://localhost:8081"),
		AnalyticsService: getEnv("ANALYTICS_SERVICE_URL", "http://localhost:8083"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
