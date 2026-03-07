# Implementation Guide

## Flow 1: Create Campaign

1. `POST /campaigns` -> handler
2. Handler validates request
3. Service applies business rules
4. Repository saves campaign

## Flow 2: Send Campaign Asynchronously

1. `POST /campaigns/{id}/send`
2. Service publishes `email.send.requested`
3. Worker consumes event and calls provider

## Flow 3: Analytics

1. Provider posts webhook to `/webhooks/provider`
2. Service increments counters by event type
3. `GET /analytics/campaigns/{id}` returns metrics
