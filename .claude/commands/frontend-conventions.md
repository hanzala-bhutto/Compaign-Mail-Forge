# Frontend Conventions

Review the specified file or component and enforce the frontend conventions used in this project.

## Usage

```
/frontend-conventions [file-path|component-name]
```

## Conventions to Check

### TypeScript
- Strict mode must be on (`"strict": true` in tsconfig)
- No `any` — use `unknown` and narrow, or define a proper type
- No `// @ts-ignore` or `// @ts-expect-error` without a specific comment explaining why
- All props interfaces named `<ComponentName>Props`
- All API response types in `src/types/` — never inline in a component

### Components
- One component per file; filename matches component name (`CampaignCard.tsx`)
- No default exports for pages — named exports only (`export function CampaignListPage`)
- Props destructured in the function signature, not inside the body
- No prop drilling more than 2 levels — use composition or context
- No business logic in components — extract to custom hooks in `src/hooks/`
- Shadcn components imported from `@/components/ui/` — never copy-paste and modify inline

### Tailwind
- No inline `style={{}}` — use Tailwind classes
- No arbitrary values like `w-[347px]` unless absolutely necessary and commented
- Responsive classes use mobile-first: `text-sm md:text-base` not the reverse
- Use `cn()` from `lib/utils.ts` for conditional class merging — never string concatenation

### Data Fetching (TanStack Query)
- Every API call goes through `src/lib/api.ts` — components never call `fetch` directly
- Query keys are arrays, defined as constants: `export const campaignKeys = { all: ['campaigns'] as const, ... }`
- Loading and error states always handled — no silent failures
- Mutations use `useMutation` with `onSuccess` invalidating related queries
- No `useEffect` for data fetching — ever

```tsx
// CORRECT
const { data: campaigns, isLoading, error } = useQuery({
    queryKey: campaignKeys.all,
    queryFn: api.campaigns.list,
})

// WRONG — never do this
useEffect(() => {
    fetch('/api/campaigns').then(...)
}, [])
```

### Forms (React Hook Form + Zod)
- Every form has a Zod schema defined above the component
- `useForm` always typed with the schema: `useForm<z.infer<typeof schema>>()`
- Validation errors displayed inline next to the field, not in a toast
- Submit button disabled while submitting (`isSubmitting` from form state)

```tsx
const campaignSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    subject: z.string().min(1, 'Subject is required'),
})

export function CreateCampaignForm() {
    const form = useForm<z.infer<typeof campaignSchema>>({
        resolver: zodResolver(campaignSchema),
    })
    // ...
}
```

### API Client (`src/lib/api.ts`)
- All endpoints defined here as typed async functions
- Base URL read from `import.meta.env.VITE_API_URL` with fallback to `/api`
- All responses typed — never `response.json()` without a type assertion
- Errors thrown as typed errors, not swallowed

```ts
export const api = {
    campaigns: {
        list: (): Promise<Campaign[]> =>
            fetch(`${BASE_URL}/campaigns`).then(res => {
                if (!res.ok) throw new ApiError(res.status, res.statusText)
                return res.json()
            }),
        create: (input: CreateCampaignInput): Promise<Campaign> => ...
    },
    analytics: {
        getByCampaign: (id: string): Promise<CampaignAnalytics> => ...
    }
}
```

### File/Folder Structure
```
src/
├── components/
│   ├── ui/           # Shadcn generated components — do not edit
│   └── <feature>/    # Feature-specific components (CampaignCard, AnalyticsChart)
├── pages/
│   ├── CampaignsPage.tsx
│   ├── CampaignDetailPage.tsx
│   └── AnalyticsPage.tsx
├── hooks/
│   ├── useCampaigns.ts
│   └── useAnalytics.ts
├── lib/
│   ├── api.ts        # API client
│   └── utils.ts      # cn() and other utilities
└── types/
    ├── campaign.ts   # mirrors backend Campaign struct
    └── analytics.ts  # mirrors backend CampaignAnalytics struct
```

### Naming
- Pages: `<Name>Page.tsx` (`CampaignsPage.tsx`)
- Hooks: `use<Name>.ts` (`useCampaigns.ts`)
- Types: singular PascalCase matching backend struct names (`Campaign`, not `ICampaign`)
- Event handlers: `handle<Event>` (`handleSubmit`, `handleDelete`)
- Boolean props/state: `is`/`has`/`can` prefix (`isLoading`, `hasError`, `canSubmit`)

## Output Format

For each violation:
1. File and line number
2. Rule violated
3. Corrected code snippet

Group by: TypeScript issues → Component issues → Styling issues → Data fetching issues

If no violations: confirm clean and note any patterns worth keeping.
