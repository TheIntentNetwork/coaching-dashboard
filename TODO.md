# IEP / Coaching Portal — Status Tracker

Last updated: 2026-07-20  
Source apps: **`brand`** (this repo) + **`../sustainable-website`** (advisor/enrollment/VA)  
Shared DB: Supabase `cgghmctyygkqzalfhqsx`

Update checkboxes as work lands. Do not delete completed items — mark them done so history stays visible.

---

## Legend

- `[x]` Done / production-usable for current scope
- `[~]` Partial / mock / deferred by design
- `[ ]` Not started

---

## A. Done — Client portal (`brand`)

### Auth & account
- [x] Sign-in / create account / forgot + update password
- [x] Supabase session persistence + middleware
- [x] IEP vs Coaching theme/copy (`My Advocate` / `My Coach`)
- [x] Enrollment password setup emails redirect IEP/Coaching → brand portal (`CLIENT_PORTAL_URL`); VA Claims stays on sustainable-website

### Setup / onboarding
- [x] Welcome step (display name, not editable input)
- [x] Milestone (meeting date + meeting type)
- [x] IEP draft upload + submit for advocate review
- [x] Waiting / under review / approved states on `/setup`
- [x] Hide Setup nav after submit

### Dashboard & SustainBL workspace
- [x] Dynamic dashboard (priority action, upcoming meeting, student name)
- [x] Ask Copilot moved to sidebar; Recent Activity removed
- [x] Documents upload/list/delete (Storage; status `ready`)
- [x] Document categories + filters + PDF-only upload dialog (D1)
- [x] Dashboard “Your Journey” case progress (Timeline tab removed from Case file)
- [x] Prep: questions / notes / checklist CRUD + templates (no must-ask flags)
- [x] Accommodations & supportive services tab (IEP) (D2) — proof dropzone + confirm delete
- [x] Compensatory service plans tab (IEP) (D3)
- [x] Process journey checklist + custom steps + reorder (IEP) (D6)
- [x] Sidebar profile card (avatar/name/status) + Settings photo upload
- [x] Dynamic meetings list + detail + summary badges
- [x] Dynamic PDF/report list + detail
- [x] Follow-up as messaging (advocate/coach labels; notify on advisor reply)
- [x] Settings: profile load/save; notification prefs; no 2FA section
- [x] Responsive shell (mobile nav, page padding utilities)
- [x] Confirm dialogs (no `window.confirm`); markdown in Ask Copilot
- [x] TanStack Query portal data layer (shared cache, mutations invalidate related keys, nav prefetch)

### Advocate / booking / Stripe
- [x] Assigned advocate profile from enrollment
- [x] Collaboration history from real meetings
- [x] Session balance (`sessions_included` / `sessions_consumed`)
- [x] Book meeting: consume credit if available
- [x] Extra session → Stripe Checkout + webhook/confirm fulfillment
- [x] Payment + success full-page screens with redirect
- [x] Meeting join credentials (`meeting_token` + absolute guest URL via `NEXT_PUBLIC_MEETING_BASE_URL`)
- [x] Join meeting button on meeting detail + upcoming list
- [x] Remote video attend option + copy (D5)

### Ask Copilot (current scope)
- [x] Chat via Ollama Cloud (`glm-5.2`)
- [x] Document embeddings on upload → EC2 Ollama `nomic-embed-text` → pgvector
- [x] Ask Copilot RAG via `match_portal_chunks`

### Meetings + SustainBL Copilot (Track A)
- [x] Prep questions/notes/checklist shown in guest call
- [x] Host saves portal summary on leave
- [x] Guest/user saves portal summary on leave (token-auth API)
- [x] Transcript persisted to `appointments.transcript_text` when available
- [x] Post-call redirect to brand `/meetings` for IEP/Coaching clients
- [x] One post-session LLM completion → family (`role=user`) summary on host hang-up
- [x] Family summary shown on meeting detail, Reports, and advocate profile past meetings
- [x] Appointment marked `completed` when host ends session

---

## B. Done — Advisor / platform (`sustainable-website`)

- [x] Advisor-assisted enrollment + Stripe products/prices
- [x] Session grants on enrollment (`sessions_included`, extra session price)
- [x] Client setup link routing by service type (IEP/Coaching → brand)
- [x] Advisor messaging → client notification email (respects prefs)
- [x] Portal setup review path for advisors (approve / request changes / under review)
- [x] My Users detail: documents by category, accommodations, compensatory status, journey (D1–D3, D6)
- [x] IEP Knowledge sidebar page (13 IDEA categories + process guide) (D4)
- [x] Meetings via Stream + SustainBL Copilot (recording exists in copilot stack)
- [x] VA Claims client experience remains on sustainable-website only

---

## C. Deferred (explicitly later)

- [x] Document embeddings → EC2 Ollama → `portal_document_chunks`
- [x] Ask Copilot RAG over SustainBL documents
- [ ] Lock down EC2 embeddings (security group / auth proxy) — currently public `:11434`
- [ ] Re-embed older documents that were uploaded before embeddings were enabled
- [x] SustainBL Copilot upgrades (participant prep + host/user summary persist) — Track A done; richer host/user report shapes can still improve later

---

## D. Adriana (IEP expert) — backlog

### D1. Evidence / document taxonomy
- [x] Document purpose/categories for IEP evidence
- [x] UI: category picker on upload + filters on Documents
- [x] Required vs optional guidance copy per category
- [x] Advisor documents panel (grouped + signed URLs)

### D2. Accommodations & supportive services
- [x] SustainBL tab (IEP-only)
- [x] Link proof documents
- [x] Visible on advisor My Users detail

### D3. Compensatory service plans
- [x] SustainBL tab + draft/submit
- [x] Advisor status + note workflow
- [x] Timeline event on submit

### D4. Coach / advisor knowledge tools
- [x] 13 IDEA disability categories page
- [x] Federal process guide (TX labels where useful)
- [x] ARD-aligned meeting types (review ARD, MDARD, STAAR-failure, FBA)

### D5. Remote attendance / multi-state
- [x] Video meetings via Stream / SustainBL Copilot
- [x] Explicit remote checkbox in booking + out-of-state copy
- [x] Recording availability copy on meeting detail / upcoming

### D6. Process journey
- [x] Lightweight milestone tracker (not a legal filing engine)
- [x] Flags for review ARD / MDARD / STAAR-failure
- [x] Advisor read-only mirror on My Users detail

---

## E. Hardening / ops (keep green for launch)

- [x] Code path uses `CLIENT_PORTAL_URL` / `NEXT_PUBLIC_CLIENT_PORTAL_URL` — **set prod values + Supabase redirect allowlist on deploy**
- [x] Brand Stripe webhook handles `portal_session_booking` (`brand/src/app/api/stripe/webhook/route.ts`) — **point live Stripe endpoint at brand webhook URL**
- [x] Backfill script: `sustainable-website/scripts/backfill-iep-coaching-sessions.ts` (DB currently has grants; re-run if needed)
- [x] E2E QA checklist below (run on staging/prod before launch)
- [ ] Lock down EC2 Ollama embeddings (separate infra ticket)

---

## Quick “what parents can do today”

| Need | Status |
|------|--------|
| Upload doctor / school paperwork | Yes |
| Categorized evidence (discipline, grades, Dojo screenshots, etc.) | Yes — D1 |
| Accommodations & services workspace | Yes — D2 |
| Compensatory plans tab | Yes — D3 |
| Message advocate + book sessions (Stripe extras) | Yes |
| Prep for meetings | Yes |
| IDEA categories for coaches | Yes — D4 |
| Remote video meeting | Yes |
| Meeting recording | Yes (copilot); copy in portal |
| Document-grounded Ask Copilot | Yes |
| Join meeting from brand portal | Yes |
| Post-call summary in Reports / meeting detail | Yes |
| Process journey checklist | Yes — D6 |

---

## UI test checklist (Adriana + Track A)

Prereqs: brand on `:3001`, sustainable-website on `:3000`, `NEXT_PUBLIC_MEETING_BASE_URL=http://localhost:3000`, enrolled IEP user with assigned advocate + availability slots.

1. **Login** to brand as IEP client — dashboard loads with your name.
2. **Set Schedule** (if not done) — pick available slot + meeting type (incl. Review ARD / MDARD) + PDF draft → success.
3. **Documents** — upload medical PDF + ClassDojo screenshot (image); filter by category.
4. **Accommodations** — add item, link proof doc, see it on advisor My Users.
5. **Compensatory** — save draft, submit; advisor marks in progress + note.
6. **Journey** — toggle milestones + STAAR flag; advisor sees mirror.
7. **Prep** — add 1 question, 1 note, 1 checklist item.
8. **Book a Meeting** — remote checkbox on; sessions left → success.
9. **Meeting detail** — Join anytime while scheduled/in progress; remote/recording copy visible.
10. **Join as client** — guest lobby; prep visible.
11. **Advisor** joins same appointment; leave → family summary generates.
12. **Reports / meeting detail / advocate profile** — family summary appears.
13. **Advisor → IEP Knowledge** — IDEA categories + process guide load.
14. **Regression** — Coaching theme: no Accommodations/Compensatory/Journey tabs.
15. **Ops** — confirm prod `CLIENT_PORTAL_URL`, Stripe live webhook for brand `portal_session_booking`.
