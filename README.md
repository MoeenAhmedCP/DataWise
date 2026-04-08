# DataWise

A multi-tenant SaaS analytics platform with AI-powered insights. Multiple companies can sign up, get isolated workspaces, upload CSV data or enter metrics manually, and see live dashboards with trend charts, automated alerts, and an AI chat assistant.


---

## Features

- **True multi-tenancy** — Row Level Security at the database level; each company sees only their own data
- **CSV import** — drag-and-drop CSV upload with column mapping and instant preview
- **Manual entry** — add individual metric data points with a form
- **AI Chat** — natural language questions about your data powered by Claude (`claude-sonnet-4-6`)
- **Automated alerts** — rule-based alerts when metrics drop, rise, or cross thresholds
- **Trend charts** — full 30-day area charts per metric with tooltips
- **KPI cards** — current value, change percent, and 7-day sparkline

---

## Architecture

### Multi-Tenancy via Row Level Security

DataWise enforces tenant isolation at the database layer using Supabase PostgreSQL RLS:

```
User signs up → creates Organization → linked via org_members table
         ↓
Every table has an RLS policy:
  "WHERE org_id = get_user_org_id()"
         ↓
get_user_org_id() queries org_members for auth.uid()
         ↓
Users can never read or write another org's data —
even with a direct SQL query or known UUID
```

1. **Org isolation at signup**: Every user creates or joins exactly one organization. Their `user_id` is linked to an `org_id` in `org_members`.

2. **RLS enforces isolation**: Every table has a Row Level Security policy calling `get_user_org_id()`. A user cannot read or write data from another org — even if they know the UUID. This is enforced at the database level.

3. **API routes respect org scope**: Every API route fetches `org_id` from the authenticated session before querying. No route accepts `org_id` as a user-supplied parameter.

4. **AI Chat is org-scoped**: The Claude prompt is built from metric data already filtered by RLS — no cross-tenant data can leak into AI responses.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v4 |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL with Row Level Security |
| Charts | Recharts |
| AI Chat | Anthropic Claude API (`claude-sonnet-4-6`) |
| File Parsing | PapaParse (browser-side CSV parsing) |
| Deploy | Vercel |

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd datawise
npm install
```

### 2. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Optionally run `supabase/seed.sql` for demo data
4. Go to **Authentication → Providers** and enable Email
5. Copy your **Project URL** and **anon key** from Settings → API

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, create your organization, and start adding data.

---

## How the AI Chat Works

1. User sends a message on `/chat`
2. API route fetches all metric definitions + last 90 days of data (filtered by RLS)
3. Builds a structured metrics context string with dates and values
4. Sends the context as a system prompt to Claude with the conversation history
5. Streams the response back using Next.js streaming
6. Frontend displays the streaming text in real-time

The AI can answer questions like:
- "Why did signups drop 3 weeks ago?"
- "What's our best performing month?"
- "Compare this month's revenue to last month"
- "Which metrics are trending down?"

---

## Deployment

### Vercel

```bash
# Push to GitHub, then:
# 1. Import repo in Vercel
# 2. Add environment variables (same as .env.local)
# 3. Deploy
```

The app is a pure Next.js app — no separate backend. Everything runs as Vercel serverless functions.

---

## Database Schema

Two main entity types:

- **Organizations + Members**: Multi-tenant foundation
- **Metric Definitions + Data**: Time-series metrics per org
- **Alerts + Alert Events**: Rule-based notification system

Run `supabase/schema.sql` to create all tables, indexes, and RLS policies.
Run `supabase/seed.sql` for demo data (Acme Corp with 90 days of realistic data including a signup drop 3 weeks ago — great for demonstrating AI chat).
