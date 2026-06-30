create table if not exists email_events (
  id                  bigserial primary key,
  campaign_id         uuid not null,
  event_type          text not null,
  provider_message_id text,
  occurred_at         timestamptz not null default now()
);

create index if not exists idx_email_events_campaign_id  on email_events(campaign_id);
create index if not exists idx_email_events_event_type   on email_events(event_type);
create index if not exists idx_email_events_occurred_at  on email_events(occurred_at);
