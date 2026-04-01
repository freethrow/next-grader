# CLAUDE.md — Essay Grading App (Studio Oskar)

## Project Overview

A web application for grading English essays against Cambridge exam assessment scales. Teachers submit student essays, select the exam level and task type, and receive detailed band scores with examiner-style commentary and actionable feedback. Starting with C2 Proficiency, designed to accommodate additional levels (C1 Advanced, B2 First, etc.) as assessment criteria are added.

Grading is done via one-shot prompts to the Anthropic API — no agents, no multi-turn conversations. The prompt includes the full assessment scale and calibration principles for the selected level.

## Stack

- **Framework**: Next.js 15, App Router, JavaScript (no TypeScript)
- **Auth**: Clerk
- **Database**: MongoDB (native JS driver, no Mongoose), hosted on Atlas
- **Styling**: Tailwind CSS + DaisyUI v5
- **AI**: Vercel AI SDK (`ai` + `@ai-sdk/anthropic`)
- **Deployment**: Vercel

## Key Conventions

- JavaScript only — no TypeScript, no `.ts`/`.tsx` files
- No `src/` directory — all code lives at root level
- Import alias `@/*` maps to the project root
- No Turbopack (disabled via `next.config.mjs`)
- No ShadCN — DaisyUI v5 for UI primitives, thin wrapper components in `components/ui/`
- No Mongoose — raw MongoDB JS driver via `lib/mongodb.js` and `lib/db.js`

## Project Structure

```
essay-grader/
├── app/
│   ├── layout.js                       # Root layout with ClerkProvider
│   ├── page.js                         # Landing / dashboard
│   ├── globals.css
│   ├── sign-in/[[...sign-in]]/page.js
│   ├── sign-up/[[...sign-up]]/page.js
│   ├── grade/page.js                   # Essay submission & grading form
│   ├── students/
│   │   ├── page.js                     # All students list with search
│   │   └── [id]/page.js               # Single student — all graded essays
│   ├── essays/
│   │   └── [id]/page.js               # Single essay — full assessment view
│   └── settings/page.js               # User preferences (default model, etc.)
├── app/api/
│   ├── grade/route.js                  # POST — submit essay, call AI, save result
│   ├── students/
│   │   ├── route.js                    # GET — list students, POST — create student
│   │   └── [id]/route.js              # GET — single student with essays
│   ├── essays/
│   │   ├── route.js                    # GET — list/search essays
│   │   └── [id]/route.js              # GET — single essay, DELETE — remove
│   └── webhooks/
│       └── clerk/route.js             # Clerk webhook for user sync
├── components/
│   ├── grading/
│   │   ├── GradeForm.js               # Essay input + level/task selection
│   │   ├── AssessmentView.js          # Rendered assessment result
│   │   ├── BandScoreTable.js          # Band scores summary table
│   │   └── FeedbackSection.js         # Strengths, areas, key errors
│   ├── students/
│   │   ├── StudentList.js
│   │   ├── StudentCard.js
│   │   └── StudentSearch.js
│   ├── essays/
│   │   ├── EssayList.js
│   │   ├── EssayCard.js
│   │   └── EssayFilters.js           # Filter by level, task type, date, score
│   ├── layout/
│   │   ├── Navbar.js
│   │   ├── Sidebar.js
│   │   └── PageHeader.js
│   └── ui/
│       ├── Button.js
│       ├── Modal.js
│       ├── Badge.js
│       ├── Input.js
│       ├── Select.js
│       ├── Textarea.js
│       ├── Card.js
│       └── Spinner.js
├── lib/
│   ├── mongodb.js                     # MongoClient singleton
│   ├── db.js                          # getDb() + getCollections()
│   ├── prompts/
│   │   ├── c2.js                      # C2 Proficiency system prompt + band descriptors
│   │   └── index.js                   # Prompt registry — getPromptForLevel('c2')
│   ├── ai.js                          # Vercel AI SDK setup — generateText() wrapper
│   ├── levels.js                      # Level metadata: labels, task types, word counts
│   └── utils.js                       # formatDate(), calculateTotalScore(), etc.
├── data/
│   └── levels.js                      # Static level definitions for UI dropdowns
├── proxy.js                            # Clerk route protection (Next.js 16 uses proxy.js)
└── .env.local
```

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=essay_grader

ANTHROPIC_API_KEY=
```

## MongoDB

### Collections

| Collection   | Purpose                                                     |
|-------------|-------------------------------------------------------------|
| `users`     | Synced from Clerk via webhook — teacher accounts            |
| `students`  | Students being assessed (not app users, just records)       |
| `essays`    | Submitted essays with full assessment results               |

### Document Schemas

#### `students`

```js
{
  _id: ObjectId,
  teacher_id: "clerk_user_id",        // Clerk user who created this student
  name: "Student Name",
  email: "optional@email.com",        // optional
  notes: "Preparing for June exam",   // optional free-text
  level: "c2",                        // current target level
  created_at: ISODate,
  updated_at: ISODate
}
```

#### `essays`

```js
{
  _id: ObjectId,
  student_id: ObjectId,               // ref to students
  teacher_id: "clerk_user_id",        // who submitted the grading
  level: "c2",                        // exam level assessed against
  task_type: "essay",                 // essay | article | letter | report | review
  task_prompt: "Optional task prompt text",
  essay_text: "Full essay text as submitted",
  word_count: 267,
  model: "claude-sonnet-4-20250514",  // model used for grading
  assessment: {
    scores: {
      content: 3,
      communicative_achievement: 4,
      organisation: 3,
      language: 4,
      total: 14
    },
    cefr_indication: "C2",
    commentary: {
      content: "...",
      communicative_achievement: "...",
      organisation: "...",
      language: "..."
    },
    strengths: ["...", "..."],
    areas_for_development: ["...", "..."],
    key_errors: {
      articles: ["..."],
      word_choice: ["..."],
      grammar: ["..."]
      // only categories where errors were found
    }
  },
  raw_response: "Full AI response text for debugging",
  created_at: ISODate
}
```

#### `users`

```js
{
  _id: "clerk_user_id",
  email: "teacher@example.com",
  name: "Teacher Name",
  image_url: "...",
  preferences: {
    default_model: "claude-sonnet-4-20250514",
    default_level: "c2"
  },
  created_at: ISODate,
  updated_at: ISODate
}
```

### Indexes

```js
// essays — query by student
db.essays.createIndex({ student_id: 1, created_at: -1 })

// essays — query by teacher
db.essays.createIndex({ teacher_id: 1, created_at: -1 })

// essays — full-text search on essay content
db.essays.createIndex({ essay_text: "text", "assessment.commentary.content": "text" })

// students — query by teacher
db.students.createIndex({ teacher_id: 1, name: 1 })

// students — text search
db.students.createIndex({ name: "text", notes: "text" })
```

### ID Strategy

- `students._id` and `essays._id`: ObjectId (auto-generated)
- `users._id`: Clerk user ID string (set explicitly on webhook sync)
- Cross-collection references use the appropriate type (ObjectId for student_id, string for teacher_id/clerk IDs)

## AI Integration

### Architecture

One-shot prompts only. No streaming needed for the grading use case — the teacher submits an essay and waits for the full assessment.

```js
// lib/ai.js
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { getPromptForLevel } from './prompts'

export async function gradeEssay({ essayText, level, taskType, taskPrompt, model }) {
  const systemPrompt = getPromptForLevel(level)

  const userMessage = buildUserMessage({ essayText, taskType, taskPrompt })

  const { text } = await generateText({
    model: anthropic(model || 'claude-sonnet-4-20250514'),
    system: systemPrompt,
    prompt: userMessage,
  })

  return parseAssessment(text)
}
```

### Prompt Structure

Each level has its own prompt file in `lib/prompts/`. The prompt includes:

1. **Role**: Cambridge examiner for the specified level
2. **Band descriptors**: Full assessment scale (bands 0–5 for C2, or level-appropriate scale)
3. **Calibration principles**: Anti-inflation rules, distinguishing slips from errors, accuracy vs. range
4. **Output format**: Structured JSON output with scores, commentary, strengths, areas, errors
5. **Task-type guidance**: Genre-specific conventions for essay, article, letter, report, review

The system prompt instructs the model to return a JSON object matching the `assessment` schema above. The `parseAssessment()` function validates and extracts the structured data.

### Prompt Registry

```js
// lib/prompts/index.js
import { c2Prompt } from './c2'
// Future: import { c1Prompt } from './c1'

const prompts = {
  c2: c2Prompt,
  // c1: c1Prompt,
  // b2: b2Prompt,
}

export function getPromptForLevel(level) {
  const prompt = prompts[level]
  if (!prompt) throw new Error(`No prompt configured for level: ${level}`)
  return prompt
}

export function getAvailableLevels() {
  return Object.keys(prompts)
}
```

### Model Selection

Teachers can choose which model to use for grading. Stored per-essay so results are reproducible and comparable. Default model is set in user preferences.

Available models (update as needed):
- `claude-sonnet-4-20250514` (default — best balance of quality and speed)
- `claude-opus-4-20250514` (highest quality, slower)
- `claude-haiku-3-5-20241022` (fastest, lower quality — useful for quick drafts)

## Auth & Data Isolation

- All data is scoped to the authenticated teacher's `clerk_user_id`
- Every API route checks `auth()` from `@clerk/nextjs/server` and filters queries by `teacher_id`
- Students and essays belong to the teacher who created them — no sharing between teachers
- Clerk webhook syncs user data to the `users` collection on sign-up and profile update

## Pages & Features

### `/grade` — Essay Grading Form
- Select or create a student (combobox with search)
- Select exam level (C2, with more coming)
- Select task type (essay, article, letter, report, review)
- Optional task prompt text field
- Essay text input (large textarea with word count)
- Select AI model
- Submit → calls `/api/grade` → displays assessment result
- Option to save the graded essay

### `/students` — Student List
- Card grid of all students for the current teacher
- Search by name
- Each card shows: name, target level, number of graded essays, average total score
- Click → navigates to `/students/[id]`

### `/students/[id]` — Student Profile
- Student info header with edit capability
- List of all graded essays, newest first
- Summary statistics: average scores per subscale, score trend over time
- Filter essays by level, task type, date range
- Click an essay → navigates to `/essays/[id]`

### `/essays/[id]` — Single Essay Assessment
- Full essay text displayed
- Complete assessment: band scores table, commentary per subscale, strengths, areas for development, key errors
- Metadata: date, level, task type, model used, word count
- Print-friendly layout
- Option to re-grade with a different model (creates a new essay record)

### `/settings` — User Preferences
- Default model selection
- Default exam level

## Styling

- Tailwind CSS for all styling
- Clean, professional aesthetic appropriate for an educational tool
- Responsive — works on desktop and tablet
- Color-code band scores: 0–1 red, 2 amber, 3 green, 4–5 dark green
- Print styles for assessment views (teachers print these for students)

## Adding a New Exam Level

To add a new level (e.g., C1 Advanced):

1. Create `lib/prompts/c1.js` with the system prompt including C1-specific band descriptors and calibration principles
2. Register it in `lib/prompts/index.js`
3. Add the level metadata to `data/levels.js` (label, task types, word counts)
4. The UI automatically picks up new levels from the registry — no component changes needed

## Development Notes

- Use `next dev` (no Turbopack flag)
- MongoDB connection string must include the database name or use `MONGODB_DB_NAME` env var
- Clerk webhook endpoint `/api/webhooks/clerk` must be configured in the Clerk dashboard with `user.created` and `user.updated` events
- The `raw_response` field in essays stores the full AI response for debugging prompt issues — do not expose this in the UI
- Word count is calculated client-side before submission and stored for reference
- All dates stored as ISODate in MongoDB, formatted client-side