create table if not exists campaigns (
  id          uuid primary key,
  name        text not null,
  subject     text not null,
  body        text not null,
  audience_id text not null,
  status      text not null,
  created_at  timestamptz not null default now()
);
