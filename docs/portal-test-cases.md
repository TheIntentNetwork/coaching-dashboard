# Portal test cases — full flow tracker

Use this while testing **iep-user-dashboard** (`:3001`) and **advisor** (`sustainable-website` `:3000`).  
Check boxes as you go. Note bugs under each section.

Last updated: 2026-07-20

---

## A. Client portal — Case file (IEP)

### A1. Documents
- [ ] Sidebar **Case file** opens `/case-file/documents` (Documents tab active; URL is not `/sustainbl`)
- [ ] Case file tabs show: **Documents · Accommodations · Compensatory · Journey · Prep** (no Timeline tab)
- [ ] **Upload File** opens a dialog (not category controls in the header)
- [ ] Dialog has: category select, guidance under category, drag-and-drop zone, choose file
- [ ] File picker accepts **PDF only** (no JPG/PNG)
- [ ] Drag-and-drop a PDF works
- [ ] Successful upload closes the dialog and lists the file
- [ ] Category filter chips filter the list
- [ ] Delete asks for confirmation
- [ ] Odd/Unicode PDFs: file still stores (may show “no extractable text” instead of hard fail)

### A2. Accommodations
- [ ] Add item with title + description
- [ ] Proof area: dashed dropzone + **Upload PDF** + **Choose from Documents**
- [ ] New upload lands in Documents as **Accommodations evidence** and links automatically
- [ ] Choose-from-Documents modal toggles links
- [ ] Edit works
- [ ] Delete asks for confirmation (does not delete instantly)

### A3. Compensatory
- [ ] Create plan (title, summary, missed services, optional dates)
- [ ] Save draft keeps it editable
- [ ] Submit to advocate locks draft and shows submitted state
- [ ] Advisor can see plan on My Users (see section B)

### A4. Journey
- [ ] Default milestones appear and can be toggled done/undone
- [ ] Situation flags (Review ARD / MDARD / STAAR) toggle
- [ ] **Add custom step** appears in the list
- [ ] Custom step can be deleted (with confirm); defaults cannot
- [ ] Drag handle reorders steps; order persists after refresh

### A5. Prep
- [ ] Add question / note / checklist item
- [ ] Templates still work if present

---

## B. Client portal — Dashboard & shell

### B1. Dashboard
- [ ] Priority Action still shows when a meeting is scheduled
- [ ] **Submitted draft** card is gone
- [ ] **Your Journey** shows case-file progress ticks (documents, IEP draft, meeting, accommodations, compensatory, journey, prep)
- [ ] Completing Case file work updates ticks after refresh/navigation
- [ ] Upcoming meeting panel still works
- [ ] Mobile layout still looks good

### B2. Sidebar
- [ ] Above Ask Copilot: rounded card with avatar (or initial) + display name
- [ ] Status line shows latest case status (or “Getting started” / “Meeting scheduled”)
- [ ] Card links to Settings

### B3. Settings
- [ ] Profile photo: drag-and-drop or choose image (PNG/JPG/WebP)
- [ ] After upload, sidebar avatar updates (may need refresh)
- [ ] Name / phone edit still works

---

## C. Advisor portal (`sustainable-website` :3000)

- [ ] Open enrolled IEP user under **My Users** → detail
- [ ] Tab bar: **Details · Setup · Documents · Accommodations · Compensatory · Journey**
- [ ] Details: enrollment + upcoming meetings (list style, not heavy cards)
- [ ] Setup: portal setup review still works (approve / request changes)
- [ ] Documents grouped by category; open via signed URL
- [ ] Accommodations list + linked proof count visible
- [ ] Compensatory: click status pill → change status (no “Mark …” button row)
- [ ] Compensatory: advisor note has **Save note** (shows Unsaved changes when dirty)
- [ ] Journey milestones + flags visible (including custom steps if parent added any)
- [ ] IEP Knowledge page still loads
- [ ] Messaging to client still works

---

## D. Regression smoke

- [ ] Set Schedule / IEP draft upload still PDF-only
- [ ] Book meeting / join credentials still work
- [ ] Messages unread badge
- [ ] Ask Copilot answers (with a normal English PDF indexed)
- [ ] Coaching theme: Case file only Documents + Prep (no IEP domain tabs)

---

## Known / deferred

| Issue | Status |
|-------|--------|
| Complex Unicode/Arabic PDFs may fail text extraction for Copilot search | Softened: upload should still succeed; search text may be empty |
| Timeline page route `/case-file/timeline` (and old `/sustainbl/*`) | Redirects to Dashboard / case-file paths |
| Advisor custom journey edit | Parent can add/reorder; advisor view is read of same data (edit on advisor optional later) |

---

## Session notes

_Add dated notes while testing:_

### 2026-07-20 — Parent Case file pass
- Documents category UX confusing → fixed as upload dialog
- Broken “recommended · guidance” line → fixed in dialog
- JPG allowed → now PDF-only
- Accommodations proof chips → dropzone + choose existing
- Instant delete on accommodations → confirm dialog
- Timeline in Case file → removed; journey progress on Dashboard
- Sidebar missing name/avatar → profile card added
