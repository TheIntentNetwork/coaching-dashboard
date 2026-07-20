# Case file guide (Adriana IEP feedback)

How the new **Case file** features work, who they help, how to test them, and what “done” looks like.

**Apps**

| App | Port (local) | Who uses it |
|-----|--------------|-------------|
| `brand` (client portal) | `:3001` | Parent / family |
| `sustainable-website` (advisor portal) | `:3000` | Advocate / coach |

**Who sees what**

- **IEP theme** clients get the full Case file tabs below.
- **Coaching theme** clients only see Documents and Prep (no Accommodations / Compensatory / Journey).

Sidebar label is **Case file** (routes under `/case-file/...`; default `/case-file/documents`).  
**Timeline** is no longer a Case file tab — case progress lives on the **Dashboard → Your Journey**.

---

## Big picture

Adriana’s feedback asked for a real advocacy workspace—not just file storage. The Case file now helps a family:

1. **Organize evidence** by type (medical, grades, ClassDojo, etc.).
2. **Track classroom supports** they want (accommodations) with linked proof.
3. **Document missed services** they believe are owed (compensatory plans).
4. **Share process status** with their advocate (journey checklist + situation flags).
5. **Prep for the right kind of meeting** (including ARD / MDARD / STAAR types).
6. **Attend remotely** when they are out of state or can’t be on campus.

The advocate sees the same case context on **My Users** (and has an **IEP Knowledge** page for IDEA categories + process guidance).

```text
Parent (brand)                         Advocate (sustainable-website)
─────────────────                      ─────────────────────────────
Case file → Documents  ─────────────►  My Users → documents by category
Case file → Accommodations ─────────►  My Users → accommodations + proof
Case file → Compensatory ───────────►  My Users → plan status + notes
Case file → Journey ────────────────►  My Users → milestones + flags
Set Schedule / Book → meeting types ►  Knows which meeting the family faces
Book → remote attend ───────────────►  Video meeting + recording copy
                                       IEP Knowledge (coach reference)
```

---

## 1. Documents — evidence categories (D1)

### How it works

- Open **Case file → Documents** (`/case-file/documents`).
- Click **Upload File** → dialog: pick a **category**, then drag-and-drop or choose a **PDF**.
- Dialog closes automatically on success. Filter the list by category chips.
- Evidence uploads are **PDF only** (export screenshots as PDF if needed).
- Setup still uses a special **IEP draft** upload during Set Schedule (hidden from the normal picker).

Categories include: Medical, PT/OT/speech, Accommodations evidence, Disciplinary, Attendance, Grades, Teacher/staff notes, District app screenshots, Other.

### How it helps the user

- Stops the “pile of random PDFs” problem.
- Advocate can find the right proof fast before a meeting.
- Parent gets light guidance (recommended vs optional) so they know what matters.

### How to test

1. Log in as an **IEP** client on brand (`:3001`).
2. Go to **Case file → Documents**.
3. Upload a medical PDF with category **Medical / doctor paperwork** via the dialog.
4. Upload another PDF under **District app screenshots** (or Grades).
5. Use the category filter — each file appears under its category.
6. On advisor portal → open that user under **My Users** — documents are grouped by category and openable via signed URL.

### Expectations

| Expect | Do not expect |
|--------|----------------|
| Files stay private to the family + assigned advocate | Instant OCR / auto-fill of IEP fields from uploads |
| Category is metadata for organization | Perfect legal taxonomy for every district |
| Ask Copilot can use ready docs for RAG (when embeddings succeed) | Every old file to be re-embedded automatically |

---

## 2. Accommodations & supportive services (D2)

### How it works

- **IEP only:** **Case file → Accommodations** (`/case-file/accommodations`).
- Add items: what the child needs in class (and related supportive services).
- **Link proof** via dashed dropzone (upload PDF → saved as accommodations evidence) or **Choose from Documents**.
- Delete asks for confirmation. Advocate sees the same list on **My Users**.

### How it helps the user

- Turns “we need more supports” into a clear shared list.
- Proof is attached, so the advocate can defend requests with evidence.
- Meeting prep becomes concrete: “here’s what we want and why.”

### How to test

1. Open **Accommodations** → add an item (title + notes).
2. Drag a PDF into the proof zone (or choose an existing document) → save.
3. Refresh — item and linked proof remain.
4. Delete asks for confirmation.
5. Advisor **My Users** for that client shows the accommodation + linked proof.

### Expectations

| Expect | Do not expect |
|--------|----------------|
| Shared living list for family + advocate | Automatic insertion into the school’s IEP software |
| Proof links from existing uploads | Legal guarantees that the school will grant the request |

---

## 3. Compensatory service plans (D3)

### How it works

- **IEP only:** **Case file → Compensatory** (`/case-file/compensatory`).
- Create a **draft**: title, summary, missed services, optional timeframe.
- **Save draft** to keep editing, or **Submit** when ready for advocate review.
- Submit creates a **Timeline** event and moves the plan out of editable draft.
- Advocate can update status and add notes on **My Users**.

### How it helps the user

- Captures “services were promised / missed” in one place instead of scattered emails.
- Gives the advocate a structured ask to work from.
- Timeline shows that something was formally submitted in the portal.

### How to test

1. Open **Compensatory** → fill title + summary + missed services → **Save draft**.
2. Edit the draft → save again.
3. **Submit** → status leaves draft; draft editing is locked.
4. Check **Dashboard → Your Journey** (and advisor My Users) for the submitted plan.
5. Advisor opens **My Users** → marks status (e.g. in progress) + note → parent still sees the plan list/status.

### Expectations

| Expect | Do not expect |
|--------|----------------|
| Draft → submit workflow | Automatic filing with TEA / district |
| Advocate status + notes | Dollar amount calculators or legal templates |
| Timeline marker on submit | Instant school response |

---

## 4. Process journey (D6)

### How it works

- **IEP only:** **Case file → Journey** (`/case-file/journey`).
- Default federal-process milestones (referral → consent → evaluation → initial ARD → IEP in place → annual review → triennial).
- Toggle done/undone; **add custom steps**; **drag to reorder**; delete custom steps (defaults stay).
- **Situation flags:** Review ARD, MDARD, STAAR failure — enough for common Texas special situations.
- Advisor sees a **read-only mirror** on My Users.

### How it helps the user

- Answers “where are we in the process?” without jargon overload.
- Flags special situations so meetings and prep stay focused.
- Shared map — parent and advocate stay aligned between calls.

### How to test

1. Open **Journey** → toggle 2–3 milestones on/off; confirm persistence after refresh.
2. Add a custom step → reorder with the grip handle → delete the custom step (confirm dialog).
3. Toggle **STAAR failure** (and/or Review ARD / MDARD) flags.
4. Advisor **My Users** shows the same milestones + flags (read-only).

### Expectations

| Expect | Do not expect |
|--------|----------------|
| Lightweight shared checklist | A legal filing engine or district portal sync |
| Flags for high-stakes situations | Automatic deadline countdowns for every state |

---

## 5. Prep (existing, still core)

### How it works

- **Case file → Prep** — questions, notes, checklist (+ templates).
- These show up in the **video meeting** (guest/host) so the call stays organized.

### How it helps

- Family walks into the ARD prepared instead of remembering everything live.
- Advocate sees priorities before/during the call.

### Quick test

Add 1 question, 1 note, 1 checklist item → join a meeting → confirm prep is visible in the call UI.

---

## 6. Dashboard journey (replaces Case file Timeline)

### How it works

- **Dashboard → Your Journey** shows case-file progress ticks (documents, IEP draft, meeting, accommodations, compensatory, journey checklist, prep).
- Event history still powers status copy in the sidebar; `/case-file/timeline` redirects to the dashboard.

### Quick test

After uploading docs / submitting compensatory / toggling journey steps, refresh Dashboard and confirm ticks update.

---

## Related (outside Case file tabs, still Adriana)

### Meeting types (D4, used in Set Schedule / booking)

Includes Annual IEP, Eligibility, Triennial, Amendment, 504, **Review ARD**, **MDARD**, **STAAR-failure review**, **FBA**.

**Test:** During Set Schedule or Book a Meeting, pick **Review ARD** or **MDARD** → it persists on setup / appointment purpose context.

### Remote attend (D5)

When booking, check **attend remotely** — copy explains out-of-state / video. Meeting detail shows join + recording availability messaging.

**Test:** Book with remote on → meeting detail shows join; join as guest on `:3000` meeting URL.

### Advisor IEP Knowledge (D4)

On advisor portal: **IEP Knowledge** — 13 IDEA disability categories + federal process guide (TX labels where useful).

**Test:** Advisor login → open IEP Knowledge → categories and process guide render.

---

## End-to-end test script (happy path)

**Prereqs**

- Brand on `:3001`, advisor site on `:3000`
- `NEXT_PUBLIC_MEETING_BASE_URL=http://localhost:3000` (or your meeting host)
- Enrolled **IEP** user with assigned advocate + availability slots
- Matching advisor login for My Users checks

| Step | Action | Pass if |
|------|--------|---------|
| 1 | Login as IEP parent | Dashboard loads with name |
| 2 | Set Schedule (if needed) | Slot + meeting type (e.g. Review ARD) + IEP draft PDF → submitted |
| 3 | Documents | Upload dialog + PDF only + category filter |
| 4 | Accommodations | Item + dropzone/choose proof; visible on advisor My Users |
| 5 | Compensatory | Draft → submit; advisor can note/status |
| 6 | Journey | Milestones + custom/reorder + STAAR flag; advisor mirror |
| 7 | Prep | Question + note + checklist item |
| 8 | Book meeting | Remote checkbox; session credit or Stripe extra |
| 9 | Meeting detail | Join available; remote/recording copy |
| 10 | Join call | Prep visible; after host ends → family summary on Reports / meeting detail |
| 11 | Coaching regression | Coaching user: **no** Accommodations / Compensatory / Journey tabs |

---

## Coaching vs IEP (regression)

| Tab | IEP | Coaching |
|-----|-----|----------|
| Documents | Yes | Yes |
| Accommodations | Yes | No |
| Compensatory | Yes | No |
| Journey | Yes | No |
| Prep | Yes | Yes |

If a coaching user can open `/case-file/accommodations` directly, they should be redirected away (IEP-only gate).

---

## What success looks like for a parent

After a week of normal use, a prepared family should be able to say:

- “My evidence is sorted so my advocate isn’t hunting.”
- “We listed the classroom supports we want, with proof attached.”
- “If services were missed, we wrote it down and submitted it.”
- “We know roughly where we are in the IEP process, and flagged MDARD / STAAR if it applies.”
- “We booked the right meeting type and can join by video if needed.”

That is the product intent of Adriana’s Case file feedback—not a full special-education legal system, but a **shared case workspace** that makes advocacy faster and clearer.
