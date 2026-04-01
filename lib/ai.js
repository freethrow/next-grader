import { generateText } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { join } from 'path'

const DEFAULT_MODEL = 'google/gemini-3.1-pro-preview'

// ---------------------------------------------------------------------------
// Grading guides — loaded once and cached
// ---------------------------------------------------------------------------

let _guidesCache = null

function loadGuides() {
  const guidesDir = join(process.cwd(), 'guides')
  const names = ['teacher_guide_c2.md', 'checklist_c2.md', 'handbook_c2.md']
  const parts = []
  for (const name of names) {
    try {
      parts.push(readFileSync(join(guidesDir, name), 'utf-8'))
    } catch {
      console.warn(`Guide not found: guides/${name}`)
    }
  }
  return parts.join('\n\n---\n\n')
}

function getGuides() {
  if (!_guidesCache) _guidesCache = loadGuides()
  return _guidesCache
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const JSON_SCHEMA_INSTRUCTION = `
You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no explanation.
The JSON must exactly match this structure:

{
  "inferred_title": "<5–10 word title inferred from essay content>",
  "band_scores": {
    "content": <integer 0–5>,
    "communicative_achievement": <integer 0–5>,
    "organisation": <integer 0–5>,
    "language": <integer 0–5>
  },
  "cefr_indication": "<e.g. C2 (borderline) — brief justification>",
  "commentary": {
    "content": "<examiner commentary citing quoted evidence>",
    "communicative_achievement": "<examiner commentary citing quoted evidence>",
    "organisation": "<examiner commentary citing cohesive devices>",
    "language": "<examiner commentary citing vocabulary and grammar examples>"
  },
  "strengths": [
    "<strength 1 with brief explanation and text reference>",
    "<strength 2>",
    "<strength 3>"
  ],
  "areas_for_development": [
    "<area 1 → concrete suggested revision>",
    "<area 2 → concrete suggested revision>"
  ],
  "key_errors": {
    "grammar": ["<error example>"],
    "word_choice": ["<error example>"],
    "collocation": ["<error example>"]
  }
}

Only include error categories where errors were actually found.
All keys must be exactly as shown — snake_case, lowercase.
`

function buildSystemPrompt() {
  const guides = getGuides()
  return `You are an expert Cambridge C2 Proficiency examiner and writing teacher.

When an essay is provided, grade it immediately. Do not ask any questions.
Produce the full structured grading report right away.

Every band score must be supported by specific quoted evidence from the essay.
Always quote actual phrases from the student's text to justify your assessments.
Be fair, precise, and constructive. Reference the official band descriptors.

${JSON_SCHEMA_INSTRUCTION}

---

${guides}`
}

// ---------------------------------------------------------------------------
// Zod schema for validation after parsing
// ---------------------------------------------------------------------------

const GradingReportSchema = z.object({
  inferred_title: z.string(),
  band_scores: z.object({
    content: z.number().int().min(0).max(5),
    communicative_achievement: z.number().int().min(0).max(5),
    organisation: z.number().int().min(0).max(5),
    language: z.number().int().min(0).max(5),
  }),
  cefr_indication: z.string(),
  commentary: z.object({
    content: z.string(),
    communicative_achievement: z.string(),
    organisation: z.string(),
    language: z.string(),
  }),
  strengths: z.array(z.string()),
  areas_for_development: z.array(z.string()),
  key_errors: z.record(z.array(z.string())),
})

// ---------------------------------------------------------------------------
// OpenRouter client
// ---------------------------------------------------------------------------

function getOpenRouter() {
  return createOpenAICompatible({
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  })
}

// ---------------------------------------------------------------------------
// Main gradeEssay export
// ---------------------------------------------------------------------------

export async function gradeEssay({ essayText, taskType, taskPrompt }) {
  const openrouter = getOpenRouter()
  const systemPrompt = buildSystemPrompt()

  let userMessage = `## Task Type\n${taskType}\n\n`
  if (taskPrompt) userMessage += `## Task Prompt\n${taskPrompt}\n\n`
  userMessage += `## Student Essay\n${essayText}`

  const { text } = await generateText({
    model: openrouter(DEFAULT_MODEL),
    system: systemPrompt,
    prompt: userMessage,
  })

  // Strip markdown code fences if the model wrapped its output anyway
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const parsed = JSON.parse(cleaned)
  const object = GradingReportSchema.parse(parsed)

  const { band_scores, inferred_title, ...rest } = object
  const total = band_scores.content + band_scores.communicative_achievement + band_scores.organisation + band_scores.language

  const assessment = {
    inferred_title,
    scores: { ...band_scores, total },
    ...rest,
  }

  return { assessment, rawResponse: text }
}
