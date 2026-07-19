# IEP / Coaching Portal — Status Tracker

Last updated: 2026-07-19  
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
- [x] Timeline from real events
- [x] Prep: questions / notes / checklist CRUD + templates (no must-ask flags)
- [x] Dynamic meetings list + detail + summary badges
- [x] Dynamic PDF/report list + detail
- [x] Follow-up as messaging (advocate/coach labels; notify on advisor reply)
- [x] Settings: profile load/save; notification prefs; no 2FA section
- [x] Responsive shell (mobile nav, page padding utilities)
- [x] Confirm dialogs (no `window.confirm`); markdown in Ask Copilot

### Advocate / booking / Stripe
- [x] Assigned advocate profile from enrollment
- [x] Collaboration history from real meetings
- [x] Session balance (`sessions_included` / `sessions_consumed`)
- [x] Book meeting: consume credit if available
- [x] Extra session → Stripe Checkout + webhook/confirm fulfillment
- [x] Payment + success full-page screens with redirect

### Ask Copilot (current scope)
- [x] Chat via Ollama Cloud (`glm-5.2`)
- [x] Document embeddings on upload → EC2 Ollama `nomic-embed-text` → pgvector
- [x] Ask Copilot RAG via `match_portal_chunks`

---

## B. Done — Advisor / platform (`sustainable-website`)

- [x] Advisor-assisted enrollment + Stripe products/prices
- [x] Session grants on enrollment (`sessions_included`, extra session price)
- [x] Client setup link routing by service type (IEP/Coaching → brand)
- [x] Advisor messaging → client notification email (respects prefs)
- [x] Portal setup review path for advisors (approve / request changes / under review)
- [x] Meetings via Stream + SustainBL Copilot (recording exists in copilot stack)
- [x] VA Claims client experience remains on sustainable-website only

---

## C. Deferred (explicitly later)

- [x] Document embeddings → EC2 Ollama → `portal_document_chunks`
- [x] Ask Copilot RAG over SustainBL documents
- [ ] Lock down EC2 embeddings (security group / auth proxy) — currently public `:11434`
- [ ] Re-embed older documents that were uploaded before embeddings were enabled
- [ ] SustainBL Copilot upgrades (participant prep payload, host vs user summary shapes) — separate branches in sustainable-website + sustainbl-copilot

---

## D. New from Adriana (IEP expert) — backlog

Priority for “get up and running” with Houston / Fort Worth compensatory pressure: **D1 → D2 → D3**, then coach tools, then process education UX.

### D1. Evidence / document taxonomy (parent uploads)
Paperwork from doctors and school already uploads today; needs **categories + clearer guidance**, not a new vault.

- [ ] Document purpose/categories for IEP evidence, e.g.:
  - Medical / doctor paperwork
  - PT / OT / speech (related services proof)
  - Accommodations & supportive services evidence
  - Disciplinary records
  - Attendance
  - Grades / report cards
  - Teacher anecdotal notes / staff feedback / para feedback
  - District platform screenshots (ClassDojo, Remind, etc.)
- [ ] UI: category picker on upload + filters on Documents
- [ ] Optional: required vs optional guidance copy per category

### D2. Accommodations & supportive services
- [ ] Dedicated place (page or SustainBL tab) for accommodations + supportive services the child needs in class
- [ ] Link/upload supporting proof (medical, PT, “can’t learn without help”, etc.)
- [ ] Visible to assigned advocate/coach on advisor side

### D3. Compensatory service plans
- [ ] New client tab/section: **Compensatory service plans** (back-tracking / missed services)
- [ ] CRUD or structured form + document attachments
- [ ] Advisor visibility / status (draft → submitted → in progress → closed)

### D4. Coach / advisor knowledge tools (mostly `sustainable-website`)
- [ ] Reference UI for **13 IDEA disability categories** (federal) for coaches/advisors
- [ ] Short US / federal process guide (Child Find → referral → consent → PWN → evaluate → initial ARD → IEP → annual / 3-year reeval; review ARD; MDARD; FBA) — read-only knowledge, not a legal filing system
- [ ] Meeting-type labels aligned with real ARD types where useful (initial, annual, review/failure, MDARD, reevaluation)

### D5. Remote attendance / multi-state
- [~] Video meetings already via Stream / SustainBL Copilot (not Zoom-specific)
- [ ] Explicit “attend via video / remote” option in booking + copy for out-of-state clients
- [ ] Confirm recording availability is obvious in meeting UI (already in copilot; surface in portal copy if needed)

### D6. Process journey (optional productization of Adriana’s flow)
Do **not** block launch on a full Child Find workflow engine. Consider later:

- [ ] Optional milestone tracker: referral → consent → evaluation window (60/45) → initial ARD → annual → 3-year reeval
- [ ] Flags for review ARD / MDARD / STAAR-failure review (Texas-aware labels, federal core)

---

## E. Hardening / ops (keep green for launch)

- [ ] Production `CLIENT_PORTAL_URL` + Supabase redirect allowlist for brand domain
- [ ] Stripe webhook live endpoint for `portal_session_booking` on brand (or shared handler)
- [ ] End-to-end QA: enroll (advisor) → setup email → brand login → setup → booking with/without credits
- [ ] Seed/backfill `sessions_*` on existing IEP/Coaching enrollments if missing

---

## Quick “what parents can do today”

| Need | Status |
|------|--------|
| Upload doctor / school paperwork | Yes (generic documents) |
| Categorized evidence (discipline, grades, Dojo screenshots, etc.) | Not yet — D1 |
| Accommodations & services workspace | Not yet — D2 |
| Compensatory plans tab | Not yet — D3 |
| Message advocate + book sessions (Stripe extras) | Yes |
| Prep for meetings | Yes |
| IDEA categories for coaches | Not yet — D4 |
| Remote video meeting | Yes (Stream); Zoom branding optional |
| Meeting recording | Yes (copilot stack); clarify in UI if needed |
| Document-grounded Ask Copilot | Deferred |
