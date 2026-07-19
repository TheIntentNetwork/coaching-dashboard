<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SustainBL Brand Portal (IEP / Coaching)

Client-facing Next.js app for **IEP** and **Coaching** parents/clients.

## Before you change code

1. Read `.cursor/rules/iep-coaching-portal.mdc` (architecture + sustainable-website links)
2. Check `TODO.md` for done vs left (including Adriana IEP backlog)
3. Deferred embeddings/RAG notes live in `README.md`

## Sibling repos (local)

- `../sustainable-website` — advisor portal, enrollment, VA Claims, Stripe catalog, setup emails
- `../sustainbl-copilot` — in-meeting AI package

## Database

- Supabase project_id: `cgghmctyygkqzalfhqsx`
- Prefer Supabase MCP `execute_sql` for schema changes (no new migration files unless asked)

## Local dev

- Brand: port **3001**
- sustainable-website: port **3000**
- Requires same Supabase env; set `CLIENT_PORTAL_URL=http://localhost:3001` on sustainable-website for setup emails
