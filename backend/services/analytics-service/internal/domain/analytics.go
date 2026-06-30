package domain

type CampaignAnalytics struct {
	CampaignID string `json:"campaign_id"`
	Delivered  int64  `json:"delivered"`
	Opened     int64  `json:"opened"`
	Clicked    int64  `json:"clicked"`
	Bounced    int64  `json:"bounced"`
	Failed     int64  `json:"failed"`
}
