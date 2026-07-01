# MailForge Frontend

React + TypeScript + Tailwind + Shadcn dashboard for the MailForge email campaign platform. Talks to the backend exclusively through `api-gateway` (see root `CLAUDE.md`).

## Pages

| Page | Route | Renders |
|------|-------|---------|
| `CampaignsPage` | `/campaigns` (also `/` → redirects here) | List of all campaigns as cards, each showing name, subject, status badge, and created date. Links to the campaign's detail page. |
| `CampaignDetailPage` | `/campaigns/:id` | Full detail for one campaign (status, audience, created date, body). Shows a "Send Campaign" action when the campaign is still a draft, and a link to its analytics. |
| `AnalyticsPage` | `/analytics/:id` | Delivered/opened/clicked/bounced/failed counts for one campaign, as stat cards. Polls every 10s while mounted. |

Routing is defined in `src/App.tsx`; all routes render inside the shared `Layout` (`src/components/Layout.tsx`), which provides the top nav.

## Components

- `src/components/campaigns/StatusBadge.tsx` — colored pill for a campaign's `draft`/`scheduled`/`sent` status
- `src/components/campaigns/DetailRow.tsx` — label/value row used in the campaign detail panel
- `src/components/analytics/StatCard.tsx` — labeled number tile used on the analytics page, with a `variant` prop (`success`/`info`/`accent`/`warning`/`destructive`) mapping to the `chart-1`..`chart-5` design tokens
- `src/components/ui/` — Shadcn-generated primitives; do not hand-edit, regenerate via the Shadcn CLI instead

## Hooks (`src/hooks/`)

| Hook | Calls | Notes |
|------|-------|-------|
| `useCampaigns()` | `api.campaigns.list` (`GET /campaigns`) | Query key: `campaignKeys.all` |
| `useCampaign(id)` | `api.campaigns.getById` (`GET /campaigns/:id`) | Query key: `campaignKeys.detail(id)`; disabled when `id` is empty |
| `useCreateCampaign()` | `api.campaigns.create` (`POST /campaigns`) | Invalidates `campaignKeys.all` on success |
| `useSendCampaign()` | `api.campaigns.send` (`POST /campaigns/:id/send`) | Invalidates both `campaignKeys.detail(id)` and `campaignKeys.all` on success |
| `useAnalytics(campaignId)` | `api.analytics.getByCampaign` (`GET /analytics/campaigns/:id`) | Query key: `analyticsKeys.byCampaign(id)`; disabled when `campaignId` is empty; `refetchInterval: 10_000` |

## Design Tokens

Shadcn "New York" token set defined in `tailwind.config.ts` + `src/index.css`: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring` — plus `success`, `warning`, and `chart-1`..`chart-5` (added for status badges and analytics stat coloring, since none of the default token set covers success/warning/data-series semantics). Both `:root` and `.dark` variants are defined for every token. `--radius: 0.5rem` is the only spacing/sizing customization; everything else uses Tailwind defaults.

## Run Locally

```bash
cd frontend
npm install
npm run dev       # starts on :5173, proxies /api/* to api-gateway :8080
```

The Vite dev server (`vite.config.ts`) proxies all `/api/*` requests to `http://localhost:8080` (the real `api-gateway`, started separately via `make run-gateway` from `backend/`) — no mocking in normal dev mode.

## Testing

```bash
npm test              # Vitest unit/component tests
npm run test:coverage # with coverage report
npm run test:e2e      # Playwright, MSW-mocked backend (VITE_API_MOCKING=true)
```

See `/test-strategy` for the full testing-layer breakdown (unit → API client → hooks → components → e2e).
