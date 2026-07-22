# SustainBL IEP User Dashboard

IEP / Coaching client portal (Next.js). Shares Supabase auth and data with `sustainable-website`.

**Status tracker:** see [`TODO.md`](./TODO.md) for done vs left (including Adriana IEP expert backlog).  
**Agent rules:** `.cursor/rules/` + [`AGENTS.md`](./AGENTS.md).

## Setup

```bash
npm install
npm run dev
```

Default local port is **3001** (see `.env` / `PORT`). Open [http://localhost:3001](http://localhost:3001).

Copy `.env.example` → `.env` and fill Supabase + Stripe keys (same project as sustainable-website).

### AI env (chat + embeddings)

| Variable | Purpose |
|----------|---------|
| `OLLAMA_BASE_URL` | Chat (Ollama Cloud), e.g. `https://ollama.com/v1` |
| `OLLAMA_API_KEY` | Chat API key |
| `COPILOT_CHAT_MODEL` | e.g. `glm-5.2` |
| `OLLAMA_EMBED_BASE_URL` | Embeddings host (EC2 Ollama), e.g. `http://54.x.x.x:11434/v1` |
| `COPILOT_EMBED_PROVIDER` | `ollama` |
| `COPILOT_EMBED_MODEL` | `nomic-embed-text` (768-d, matches pgvector) |

On document upload: extract → chunk → embed → `portal_document_chunks`.  
Ask Copilot retrieves via `match_portal_chunks` and grounds answers in those excerpts.

## Routes

| Path | Screen |
|------|--------|
| `/login` | Login |
| `/forgot-password` | Forgot password |
| `/update-password` | Update password |
| `/setup` | Onboarding step 1 — welcome |
| `/setup/milestone` | Onboarding step 2 — meeting |
| `/setup/documentation` | Onboarding step 3 — upload |
| `/dashboard` | Home |
| `/case-file/*` | Case file workspace (Documents, Prep, IEP tabs). Old `/sustainbl/*` redirects here. |
| `/meetings` | Meetings |
| `/meetings/[id]` | Meeting detail |
| `/follow-up` | Messages with assigned advocate/coach |
| `/reports` | Family PDF list |
| `/reports/[id]` | PDF preview |
| `/ask-copilot` | Ask Copilot (document RAG) |
| `/advocate` | Advocate profile & booking (+ Stripe extra sessions) |
| `/settings` | Settings |

## Design notes

- SustainBL workspace holds Timeline / Documents / Prep
- Brand colors and fonts (`EB Garamond`, `Manrope`) live in CSS variables (`src/app/globals.css`)
- Embeddings run on **AWS EC2** Ollama; chat stays on Ollama Cloud unless you change `OLLAMA_BASE_URL`
