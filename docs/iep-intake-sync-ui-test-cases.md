# IEP Intake Sync UI Test Cases

This checklist verifies the parent-vs-student identity split and intake sync across:

- `sustainable-website` (intake + advisor portal)
- `brand` (client portal)

Use this as a browser test script.

## Environment

- Sustainable website: `http://localhost:3000`
- Brand client portal: `http://localhost:3001`
- Test flow: IEP intake -> schedule -> advisor enrollment -> client login -> advisor review

## Test 1: Intake wording clarity (parent vs student)

**Page:** `http://localhost:3000/intake/iep`

### Steps

1. Open the intake form.
2. Inspect first section title and first name field label.
3. Continue to the student section.
4. Inspect child name label and section description.

### Expected

- First section title reads `Parent/Guardian Contact Information`.
- Name field reads `Parent/Guardian Name`.
- Parent field hint explains this is the adult managing account communication.
- Child section title reads `Student Information`.
- Child name field reads `Child/Student Full Name`.
- Child field hint explains this is the student receiving IEP services.

## Test 2: Enrollment sync creates student profile data

**Precondition:** Complete IEP intake and complete advisor-assisted enrollment checkout.

### Steps

1. Finish intake with child/student values (name, grade, district, IEP status, etc.).
2. Schedule and complete advisor-assisted enrollment.
3. Open Supabase table view (or admin query) for `portal_iep_profiles` for that user.

### Expected

- A `portal_iep_profiles` row exists for the enrolled `user_id`.
- Row includes child/case fields from intake:
  - `child_name`, `grade_level`, `school_district`, `current_iep_status`, etc.
- `intake_answers` JSON contains full raw intake payload.
- `portal_setup.student_name` is seeded with `child_name` if setup name was empty.

## Test 3: Client dashboard identity split + student overview

**Page:** `http://localhost:3001/dashboard`

### Steps

1. Log in as the enrolled IEP client (parent account).
2. Open dashboard header.
3. Inspect the **Student overview** card below the hero.

### Expected

- Header displays parent-vs-student separation:
  - `Parent account: <parent name>`
  - `Student: <child name>`
- Student details may include grade and district when available.
- Student identity is not replaced by parent profile name.
- Student overview shows intake basics (status, disability, services) and narrative fields (challenges, goals, accommodations, parent concerns) when synced.
- Link **Review accommodations** goes to `/case-file/accommodations`.

## Test 4: Setup page uses student identity

**Page:** `http://localhost:3001/setup`

### Steps

1. Open setup flow step 1.
2. Read the welcome copy and continue action.

### Expected

- Setup copy references student identity (not parent identity).
- Continue saves/uses `student_name` as student-facing value.
- If student name is missing, error message asks for student name update.

## Test 5: Settings page shows student profile block

**Page:** `http://localhost:3001/settings`

### Steps

1. Open settings as the enrolled client.
2. Find `Student profile` block.

### Expected

- Student block displays:
  - student name
  - grade level
  - school district
  - current IEP status
- Parent profile section remains separate for account/login details.

## Test 6: Advisor details page identity summary

**Page:** `http://localhost:3000/advisor/users/{clientUserId}` (via My Users list)

### Steps

1. Log in as assigned advisor.
2. Open `My Users` and enter a verified IEP client.
3. On `Details` tab, inspect top summary panel.

### Expected

- `Identity summary` block appears.
- Parent and student fields are shown separately:
  - Parent/Guardian name, email, phone
  - Student name, grade, district
- No mixed labeling between parent and student.

## Test 7: Advisor Intake tab shows structured and raw intake

**Page:** same user detail page in advisor portal

### Steps

1. Switch to `Intake` tab.
2. Inspect sections and values.

### Expected

- Tab shows:
  - Parent contact section
  - Student profile section
  - Meeting context section (challenges, goals, accommodations, services, concerns)
  - Raw intake answers section
- Values are populated from `portal_iep_profiles` + `intake_answers`.
- `Synced from intake` timestamp is present when sync completed.

## Test 7b: Accommodations + Prep seeded from survey

**Pages:**
- Client: `http://localhost:3001/case-file/accommodations`
- Client: `http://localhost:3001/case-file/prep`

### Steps

1. After a fresh IEP enrollment (new client), open Accommodations.
2. Open Prep.

### Expected

- Accommodations has a draft item titled `Accommodations from intake` (description = survey text).
- If services were selected (not "No services"), also see `Current services from intake`.
- Prep has intake-seeded notes such as school challenges, IEP goals, parent concerns (template keys `intake_*`).
- Re-running sync later does not duplicate those seeded rows.

## Test 8: Non-IEP clients are unaffected

### Steps

1. Open advisor detail for a non-IEP client.
2. Check visible tabs and details.

### Expected

- IEP-specific intake tab/fields do not appear for non-IEP clients.
- Existing non-IEP behavior remains unchanged.

## Test 9: Regression check for sign-out/login flow

### Steps

1. In advisor portal, click `Sign out`.

### Expected

- User is redirected to `/login`.

