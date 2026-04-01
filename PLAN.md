# PLAN.md — Essay Grading App Implementation Plan

## Overview

This plan follows a layered approach: infrastructure first (project, DB, auth), then UI shell with Tailwind, then AI integration. Each phase produces a working state that can be verified before moving on.

---

## Phase 1: Project Setup

**Goal**: Clean Next.js 15 project with JavaScript, Tailwind CSS, correct folder structure, and all conventions from CLAUDE.md in place.

### Steps

1. **Initialize the project**
   - `npx create-next-app@latest essay-grader`
   - Options: JavaScript (no TypeScript), App Router, Tailwind CSS, ESLint, no `src/` directory, import alias `@/*`
   - Verify: `npm run dev` serves the default page

2. **Clean the boilerplate**
   - Strip default content from `app/page.js` — replace with a simple "Essay Grader" heading
   - Clean `app/globals.css` — keep `@import "tailwindcss"` and `@plugin "daisyui"` plus base body styles (Tailwind v4 syntax, no `@tailwind` directives)
   - Remove any default images/icons from `public/`

3. **Create the folder skeleton** (empty files with placeholder exports)
   ```
   lib/
     mongodb.js
     db.js
     ai.js
     utils.js
     levels.js
     prompts/
       index.js
       c2.js
   data/
     levels.js
   components/
     ui/        → Button.js, Card.js, Input.js, Select.js, Textarea.js, Badge.js, Modal.js, Spinner.js
     layout/    → Navbar.js, Sidebar.js, PageHeader.js
     grading/   → GradeForm.js, AssessmentView.js, BandScoreTable.js, FeedbackSection.js
     students/  → StudentList.js, StudentCard.js, StudentSearch.js
     essays/    → EssayList.js, EssayCard.js, EssayFilters.js
   ```

4. **Create `.env.local` template**
   - All env vars from CLAUDE.md, values left blank
   - Add `.env.local` to `.gitignore` (should already be there)

5. **Create `data/levels.js`** — static level definitions
   ```js
   export const LEVELS = {
     c2: {
       label: 'C2 Proficiency',
       taskTypes: ['essay', 'article', 'letter', 'report', 'review'],
       wordCounts: {
         essay: { min: 240, max: 280, label: 'Part 1' },
         article: { min: 280, max: 320, label: 'Part 2' },
         letter: { min: 280, max: 320, label: 'Part 2' },
         report: { min: 280, max: 320, label: 'Part 2' },
         review: { min: 280, max: 320, label: 'Part 2' },
       },
       subscales: ['content', 'communicative_achievement', 'organisation', 'language'],
       maxBand: 5,
     },
   }

   export const MODELS = [
     { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', default: true },
     { id: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
     { id: 'claude-haiku-3-5-20241022', label: 'Claude Haiku 3.5' },
   ]
   ```

### Verify
- `npm run dev` works
- All folders exist
- `.env.local` is in place (empty values)

---

## Phase 2: MongoDB Connection

**Goal**: Working MongoDB connection with the singleton pattern, `getDb()` helper, and a seed/index script.

### Steps

1. **Install the driver**
   ```bash
   npm install mongodb
   ```

2. **Create `lib/mongodb.js`** — MongoClient singleton
   ```js
   import { MongoClient } from 'mongodb'

   const uri = process.env.MONGODB_URI
   const options = {}

   let client
   let clientPromise

   if (process.env.NODE_ENV === 'development') {
     if (!global._mongoClientPromise) {
       client = new MongoClient(uri, options)
       global._mongoClientPromise = client.connect()
     }
     clientPromise = global._mongoClientPromise
   } else {
     client = new MongoClient(uri, options)
     clientPromise = client.connect()
   }

   export default clientPromise
   ```

3. **Create `lib/db.js`** — database + collection helpers
   ```js
   import clientPromise from './mongodb'

   export async function getDb() {
     const client = await clientPromise
     return client.db(process.env.MONGODB_DB_NAME)
   }

   export async function getCollections() {
     const db = await getDb()
     return {
       users: db.collection('users'),
       students: db.collection('students'),
       essays: db.collection('essays'),
     }
   }
   ```

4. **Create `scripts/setup-indexes.mjs`** — run once to create indexes
   ```js
   // Standalone script: node scripts/setup-indexes.mjs
   // Requires MONGODB_URI and MONGODB_DB_NAME env vars
   import { MongoClient } from 'mongodb'
   import 'dotenv/config'  // npm install dotenv --save-dev

   const client = new MongoClient(process.env.MONGODB_URI)
   await client.connect()
   const db = client.db(process.env.MONGODB_DB_NAME)

   // Create indexes per CLAUDE.md
   await db.collection('essays').createIndex({ student_id: 1, created_at: -1 })
   await db.collection('essays').createIndex({ teacher_id: 1, created_at: -1 })
   await db.collection('essays').createIndex({ essay_text: 'text', 'assessment.commentary.content': 'text' })
   await db.collection('students').createIndex({ teacher_id: 1, name: 1 })
   await db.collection('students').createIndex({ name: 'text', notes: 'text' })

   console.log('Indexes created')
   await client.close()
   ```

5. **Create a test API route** `app/api/health/route.js`
   ```js
   import { getDb } from '@/lib/db'

   export async function GET() {
     const db = await getDb()
     const result = await db.command({ ping: 1 })
     return Response.json({ status: 'ok', db: result })
   }
   ```

### Verify
- Fill in `MONGODB_URI` and `MONGODB_DB_NAME` in `.env.local`
- `npm run dev` → hit `http://localhost:3000/api/health` → see `{ status: "ok" }`
- Run `node scripts/setup-indexes.mjs` → indexes appear in Atlas
- Delete the health route after verification (or keep it)

---

## Phase 3: Clerk Authentication

**Goal**: Clerk fully integrated — sign-in/sign-up pages, middleware protecting routes, webhook syncing users to MongoDB.

### Steps

1. **Install Clerk**
   ```bash
   npm install @clerk/nextjs
   ```

2. **Configure `.env.local`** — add Clerk keys from the Clerk dashboard

3. **Wrap the app in ClerkProvider** — `app/layout.js`
   ```js
   import { ClerkProvider } from '@clerk/nextjs'
   // Wrap <html><body>...</body></html> with <ClerkProvider>
   ```

4. **Create `proxy.js`** at project root (Next.js 16 renamed `middleware.js` → `proxy.js`)
   ```js
   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

   const isPublicRoute = createRouteMatcher([
     '/',
     '/sign-in(.*)',
     '/sign-up(.*)',
     '/api/webhooks(.*)',
   ])

   export default clerkMiddleware(async (auth, request) => {
     if (!isPublicRoute(request)) {
       await auth.protect()
     }
   })

   export const config = {
     matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
   }
   ```

5. **Create sign-in and sign-up pages**
   - `app/sign-in/[[...sign-in]]/page.js` — renders `<SignIn />`
   - `app/sign-up/[[...sign-up]]/page.js` — renders `<SignUp />`
   - Center them on the page with Tailwind (`flex items-center justify-center min-h-screen`)

6. **Create the Clerk webhook endpoint** — `app/api/webhooks/clerk/route.js`
   - Verify the webhook signature using `svix`
   - Handle `user.created` and `user.updated` events
   - Upsert to the `users` collection with `_id` = Clerk user ID
   - Install: `npm install svix`

7. **Add `<UserButton />` to the Navbar component**
   - Shows user avatar when signed in, sign-in link when not

### Verify
- Visit `/sign-in` → Clerk sign-in form appears
- Sign in → redirected to `/`
- Visit `/grade` without auth → redirected to `/sign-in`
- Check MongoDB `users` collection → document created with Clerk ID
- `<UserButton />` renders in the navbar

---

## Phase 4: UI Shell — Layout + Pages with Tailwind

**Goal**: All pages exist with proper layouts, navigation, and placeholder content. No API calls yet — just the visual structure and client-side interactions (forms, modals, filters).

### Step 4.1: Base UI Components

Use **DaisyUI v5** for UI primitives. Components in `components/ui/` are thin wrappers that apply DaisyUI classes and expose consistent props — they do not reimplement styling from scratch.

DaisyUI is configured via `@plugin "daisyui"` in `globals.css` (Tailwind v4 plugin syntax).

- **Button.js**: wraps `<button>` with `btn`, `btn-primary`, `btn-secondary`, `btn-error`, `btn-ghost` classes; `size` prop maps to `btn-sm`/`btn-lg`; `loading` shows DaisyUI `loading` spinner inline
- **Card.js**: wraps DaisyUI `card` + `card-body`; optional `onClick` for clickable cards
- **Input.js**: `fieldset` + `label` + `input` with DaisyUI `input` class; error state via `input-error` + helper text
- **Select.js**: `fieldset` + `label` + `select` with DaisyUI `select` class; accepts `options` array prop
- **Textarea.js**: `fieldset` + `label` + `textarea` with DaisyUI `textarea` class; optional word count display below
- **Badge.js**: DaisyUI `badge` with semantic color variants (`badge-error`, `badge-warning`, `badge-success`); `scoreToBadgeVariant(n)` helper maps band scores: `0–1 → error`, `2 → warning`, `3 → success`, `4–5 → badge-accent`
- **Modal.js**: DaisyUI `modal` + `modal-box`; controlled via `open` prop; close button + backdrop click dismiss
- **Spinner.js**: DaisyUI `loading loading-spinner` element

### Step 4.2: Layout Components

- **Navbar.js**: Top bar with app name ("Essay Grader"), nav links (Grade, Students, Settings), `<UserButton />` from Clerk on the right
- **Sidebar.js**: Optional — may decide to use top nav only. If used: collapsible sidebar with links
- **PageHeader.js**: Page title + optional subtitle + optional action button (e.g., "New Student")

**Decision**: Start with top navbar only (no sidebar) for simplicity. Pages use `PageHeader` for consistent headings.

### Step 4.3: Root Layout (`app/layout.js`)

- `<ClerkProvider>`
- `<html>` with Tailwind's `antialiased` class
- `<body>` with `<Navbar />` at top, `<main className="max-w-7xl mx-auto px-4 py-8">` for content
- Import `globals.css`

### Step 4.4: Page Shells

Each page gets a working visual shell. Data is hardcoded/mock at this stage.

#### `/` — Dashboard (app/page.js)
- Welcome message with teacher name (from `useUser()`)
- Quick stats cards: total students, total essays graded, recent activity
- "Grade an Essay" CTA button → links to `/grade`
- Recent essays list (last 5) — hardcoded mock data

#### `/grade` — Grading Form (app/grade/page.js)
- `<GradeForm>` component:
  - Student selector: dropdown or combobox. "Select student" + "Create new" option that opens a modal
  - Level selector: dropdown populated from `data/levels.js` (`LEVELS`)
  - Task type selector: dropdown, options change based on selected level
  - Task prompt: optional text input
  - Essay text: large `<Textarea>` with live word count. Show expected range from level config (e.g., "240–280 words for Part 1 Essay")
  - Model selector: dropdown from `data/levels.js` (`MODELS`)
  - Submit button: "Grade Essay" — disabled until required fields filled
- Below the form: `<AssessmentView>` — hidden initially, shown after grading completes
- `<AssessmentView>` subcomponents:
  - `<BandScoreTable>` — 4 subscales + total, color-coded badges
  - `<FeedbackSection>` — tabs or sections for Commentary, Strengths, Areas for Development, Key Errors

#### `/students` — Student List (app/students/page.js)
- `<PageHeader title="Students">` with "Add Student" button
- `<StudentSearch>` — text input for filtering by name
- `<StudentList>` — grid of `<StudentCard>` components
- `<StudentCard>` — name, level badge, essay count, average score, click to navigate
- "Add Student" modal: name (required), email (optional), notes (optional), target level

#### `/students/[id]` — Student Profile (app/students/[id]/page.js)
- Student info header: name, email, level, notes. Edit button → inline edit or modal
- Stats row: total essays, average total score, average per subscale
- `<EssayFilters>` — filter by level, task type, date range
- `<EssayList>` — chronological list of `<EssayCard>` components
- `<EssayCard>` — date, task type, level, total score with band badges, first line of essay text. Click → `/essays/[id]`

#### `/essays/[id]` — Essay Assessment (app/essays/[id]/page.js)
- Metadata bar: student name (linked), date, level, task type, model used, word count
- Two-column layout on desktop:
  - Left: essay text (styled as document/paper)
  - Right: assessment panel
- Assessment panel:
  - `<BandScoreTable>` at top
  - Commentary sections (expandable or tabbed): Content, Communicative Achievement, Organisation, Language
  - Strengths list
  - Areas for Development list
  - Key Errors (grouped by category)
- Action bar: "Print" button (triggers `window.print()`), "Re-grade" button (navigates to `/grade` pre-filled)
- Print CSS: hide navbar, single-column layout, all sections expanded

#### `/settings` — Preferences (app/settings/page.js)
- Default model selector
- Default level selector
- Save button → calls API to update user preferences

### Step 4.5: Navigation & Active States

- Navbar highlights the current route
- All page transitions use Next.js `<Link>` components
- Breadcrumbs on detail pages: Students → Student Name → Essay #date

### Verify
- All pages render with correct layouts
- Navigation between pages works
- Forms accept input (no submission yet)
- Responsive: check at 1280px, 1024px, 768px widths
- Word count updates live in the essay textarea
- Modal opens/closes for "Add Student"
- Band score badges show correct colors with mock data

---

## Phase 5: API Routes + MongoDB CRUD

**Goal**: All API routes wired to MongoDB. Pages fetch real data. Forms submit and persist.

### Step 5.1: Student CRUD

- **`POST /api/students`** — create student, set `teacher_id` from `auth()`, return created document
- **`GET /api/students`** — list students for current teacher, support `?search=` query param for text search
- **`GET /api/students/[id]`** — single student + their essays (aggregation or two queries)
- **`PUT /api/students/[id]`** — update student name/email/notes/level
- **`DELETE /api/students/[id]`** — delete student (and optionally their essays — decide on policy)

### Step 5.2: Essay CRUD

- **`GET /api/essays`** — list essays for current teacher, support filters: `?student_id=`, `?level=`, `?task_type=`, `?sort=`
- **`GET /api/essays/[id]`** — single essay with full assessment
- **`DELETE /api/essays/[id]`** — delete single essay

### Step 5.3: Settings

- **`GET /api/settings`** — return current user preferences from `users` collection
- **`PUT /api/settings`** — update preferences

### Step 5.4: Wire Pages to APIs

- Replace all mock data with `fetch()` calls to API routes
- Use `useEffect` + `useState` for client components, or server components with direct DB access where appropriate
- Add loading states (Spinner) and error handling
- Student search: debounced input → `GET /api/students?search=...`

### Step 5.5: Auth Guard Pattern

Every API route follows this pattern:
```js
import { auth } from '@clerk/nextjs/server'

export async function GET(request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // All queries include: { teacher_id: userId }
}
```

### Verify
- Create a student → appears in the students list
- Edit a student → changes persist on refresh
- Students list search filters correctly
- Navigate to student profile → see their (empty) essay list
- Settings save and load correctly
- All routes return 401 when not authenticated

---

## Phase 6: AI Integration — Vercel AI SDK + C2 Prompt

**Goal**: The `/grade` page submits an essay, calls the Anthropic API via Vercel AI SDK, receives structured assessment JSON, saves it to MongoDB, and displays the result.

### Step 6.1: Install Dependencies

```bash
npm install ai @ai-sdk/anthropic
```

### Step 6.2: Create the C2 Prompt — `lib/prompts/c2.js`

The system prompt must include:
1. **Role assignment**: "You are a Cambridge C2 Proficiency Writing examiner..."
2. **Full band descriptors**: All four subscales (Content, Communicative Achievement, Organisation, Language), bands 0–5, copied from the C2 skill's `references/c2-band-descriptors.md`
3. **Calibration principles**: The 7 anti-inflation rules from the C2 skill (Band 5 is exceptional not "very good", accuracy alone doesn't earn high Language marks, etc.)
4. **Task-type conventions**: Genre-specific guidance for essay, article, letter, report, review
5. **Output format instruction**: Return ONLY a JSON object matching the `assessment` schema from CLAUDE.md. No markdown, no preamble, no explanation outside the JSON.

The JSON output schema the prompt requests:
```json
{
  "scores": {
    "content": 3,
    "communicative_achievement": 4,
    "organisation": 3,
    "language": 4,
    "total": 14
  },
  "cefr_indication": "C2",
  "commentary": {
    "content": "...",
    "communicative_achievement": "...",
    "organisation": "...",
    "language": "..."
  },
  "strengths": ["...", "..."],
  "areas_for_development": ["...", "..."],
  "key_errors": {
    "articles": ["..."],
    "word_choice": ["..."]
  }
}
```

Export as `export const c2Prompt = \`...\``

### Step 6.3: Prompt Registry — `lib/prompts/index.js`

```js
import { c2Prompt } from './c2'

const prompts = { c2: c2Prompt }

export function getPromptForLevel(level) {
  const prompt = prompts[level]
  if (!prompt) throw new Error(`No prompt for level: ${level}`)
  return prompt
}

export function getAvailableLevels() {
  return Object.keys(prompts)
}
```

### Step 6.4: AI Wrapper — `lib/ai.js`

```js
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { getPromptForLevel } from './prompts'

export async function gradeEssay({ essayText, level, taskType, taskPrompt, model }) {
  const systemPrompt = getPromptForLevel(level)

  let userMessage = `## Task Type\n${taskType}\n\n`
  if (taskPrompt) userMessage += `## Task Prompt\n${taskPrompt}\n\n`
  userMessage += `## Student Essay\n${essayText}`

  const { text } = await generateText({
    model: anthropic(model || 'claude-sonnet-4-20250514'),
    system: systemPrompt,
    prompt: userMessage,
  })

  return parseAssessment(text)
}

function parseAssessment(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  // Validate required fields
  if (!parsed.scores || !parsed.commentary) {
    throw new Error('Invalid assessment structure')
  }

  // Calculate total if not present
  if (!parsed.scores.total) {
    const { content, communicative_achievement, organisation, language } = parsed.scores
    parsed.scores.total = content + communicative_achievement + organisation + language
  }

  return parsed
}
```

### Step 6.5: Grading API Route — `app/api/grade/route.js`

```js
// POST { student_id, level, task_type, task_prompt, essay_text, model }
// → call gradeEssay() → save to essays collection → return essay document
```

Flow:
1. Authenticate with `auth()`
2. Validate request body (required: student_id, level, task_type, essay_text)
3. Verify student belongs to this teacher
4. Call `gradeEssay()` from `lib/ai.js`
5. Build essay document per CLAUDE.md schema (include `raw_response`, `word_count`, timestamps)
6. Insert into `essays` collection
7. Return the complete essay document

### Step 6.6: Wire the GradeForm

- Form submission calls `POST /api/grade`
- Show loading state with Spinner while AI processes (can take 10–30 seconds)
- On success: display `<AssessmentView>` with the returned assessment
- On error: show error message, allow retry
- After successful grading: "View Full Assessment" link to `/essays/[id]`

### Step 6.7: Test with Real Essay

Use a known C2-level essay to verify:
- Scores are in valid range (0–5 per subscale)
- Commentary references specific parts of the essay
- JSON parses correctly
- Document saves to MongoDB with all fields
- Assessment renders correctly in the UI
- Band score badges show correct colors

### Verify
- Submit an essay through the form → loading spinner → assessment appears
- Scores are reasonable and well-calibrated (not all 5s)
- Commentary is specific, not generic
- Essay document in MongoDB has all fields from the schema
- Navigate to `/essays/[id]` → same assessment displays correctly
- Navigate to `/students/[id]` → essay appears in the student's list
- Try different models → assessment varies slightly, model name saved correctly
- Error handling: submit empty essay → proper error message

---

## Phase 7: Polish & Print

**Goal**: Final refinements — print styles, UX improvements, edge cases.

### Steps

1. **Print stylesheet** for `/essays/[id]`
   - Hide navbar and navigation
   - Single-column layout
   - All sections expanded (no tabs/accordions)
   - School/app name in print header
   - Student name + date in print header

2. **Dashboard stats** on `/` — replace mock data with real aggregation queries
   - Count of students, count of essays, average scores
   - Recent essays list (last 5, with student name and score)

3. **Word count validation**
   - Warn (not block) when essay is outside expected word range for the selected level/task type
   - Show as amber text below the textarea

4. **Re-grade flow**
   - From `/essays/[id]`, "Re-grade" button pre-fills the grade form with the same essay text, student, level, task type
   - Creates a new essay document (keeps the old one for comparison)

5. **Empty states**
   - No students yet → "Add your first student" CTA
   - No essays for a student → "Grade their first essay" CTA
   - No search results → "No students/essays found" message

6. **Error boundaries**
   - Wrap pages in error boundaries for graceful failure
   - API errors show user-friendly messages

7. **Mobile responsiveness check**
   - Assessment view stacks to single column on mobile
   - Grade form is usable on tablet

---

## Sequence Summary

| Phase | What | Key Files | Depends On |
|-------|------|-----------|------------|
| 1 | Project setup | `package.json`, folder structure, `data/levels.js` | Nothing |
| 2 | MongoDB | `lib/mongodb.js`, `lib/db.js`, `scripts/setup-indexes.mjs` | Phase 1 |
| 3 | Clerk auth | `proxy.js`, sign-in/up pages, webhook route | Phase 1 |
| 4 | UI shell | All `components/`, all `app/` pages | Phase 1, 3 |
| 5 | API + CRUD | All `app/api/` routes, wire pages to data | Phase 2, 3, 4 |
| 6 | AI grading | `lib/prompts/c2.js`, `lib/ai.js`, `app/api/grade/route.js` | Phase 5 |
| 7 | Polish | Print CSS, empty states, error handling | Phase 6 |

Phases 2 and 3 can be done in parallel since they're independent.