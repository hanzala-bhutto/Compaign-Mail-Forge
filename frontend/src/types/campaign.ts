export interface Campaign {
  id: string
  name: string
  subject: string
  body: string
  audience_id: string
  status: 'draft' | 'scheduled' | 'sent'
  created_at: string
}

export interface CreateCampaignInput {
  name: string
  subject: string
  body: string
  audience_id: string
}
