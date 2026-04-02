import { generateText } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DEFAULT_MODEL = 'google/gemini-3.1-pro-preview'

// ---------------------------------------------------------------------------
// Grading guides — loaded once and cached
// ---------------------------------------------------------------------------

const _guidesCache = {}

function loadGuides(level) {
  const guidesDir = join(process.cwd(), 'guides', level)
  let files = []
  try {
    files = readdirSync(guidesDir).filter((f) => f.endsWith('.md'))
  } catch {
    console.warn(`No guides directory found for level: ${level}`)
    return ''
  }
  const parts = []
  for (const name of files) {
    try {
      parts.push(readFileSync(join(guidesDir, name), 'utf-8'))
    } catch {
      console.warn(`Guide not found: guides/${level}/${name}`)
    }
  }
  return parts.join('\n\n---\n\n')
}

function getGuides(level = 'c2') {
  if (!_guidesCache[level]) _guidesCache[level] = loadGuides(level)
  return _guidesCache[level]
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

const TASK_TYPE_GUIDANCE = {
  essay: `
**Genre: Essay**
- Discursive or argumentative prose addressed to a teacher or educated audience.
- Requires a clear thesis, developed arguments with supporting evidence, and a conclusion.
- Communicative Achievement: assess whether the register is appropriately formal/semi-formal, ideas are developed rather than listed, and the writing engages the reader intellectually.
- Organisation: look for an introduction, logically sequenced body paragraphs, and a conclusion. Transitions between ideas are essential.`,

  article: `
**Genre: Article**
- Written for a magazine, website, or newsletter. Audience may be general or specialised.
- Requires an engaging title/heading, a hook opening, and often a direct address to the reader.
- Communicative Achievement: assess whether the tone is engaging and appropriate for the target publication, not overly formal. Personal anecdotes or rhetorical questions are characteristic features.
- Organisation: expect a punchy title, varied paragraph lengths, and a memorable closing.`,

  letter: `
**Genre: Formal or semi-formal letter**
- May be a letter of application, complaint, recommendation, or reference.
- Requires appropriate salutation and sign-off (Dear Sir/Madam → Yours faithfully; Dear [Name] → Yours sincerely).
- Communicative Achievement: assess whether conventions (opening/closing formulae, formal register, clear purpose statement) are correctly applied.
- Organisation: introduction stating purpose, body developing points in separate paragraphs, conclusion with call to action or closing remark.`,

  email: `
**Genre: Formal or semi-formal email**
- Similar to a letter but may be slightly less formal. Subject line expected.
- Communicative Achievement: assess appropriate register for the recipient (colleague vs. stranger), clear subject line, and professional tone.
- Organisation: brief greeting, clear purpose in opening, organised body, polite close.`,

  report: `
**Genre: Report**
- Factual, structured document for a specific reader (manager, committee, etc.).
- Requires section headings (Introduction, Findings, Recommendations, Conclusion).
- Communicative Achievement: assess whether the report conventions are followed — impersonal register, use of headings, factual and objective tone. No personal narrative.
- Organisation: rigid structure with labelled sections is expected and rewarded.`,

  review: `
**Genre: Review**
- Critical evaluation of a book, film, restaurant, product, event, etc.
- Requires a clear recommendation and a balance of description and evaluation.
- Communicative Achievement: assess whether the review informs AND evaluates, uses an appropriate register for the target publication, and ends with a clear recommendation.
- Organisation: brief description → evaluation of key aspects → overall recommendation.`,

  story: `
**Genre: Story**
- Narrative writing, often with a given opening or closing sentence.
- Requires a clear narrative arc: setting, build-up, climax, resolution.
- Communicative Achievement: assess narrative technique — use of descriptive language, varied sentence rhythm, dialogue if appropriate, and engagement of the reader.
- Organisation: chronological or non-linear structure should be controlled and purposeful.`,
}

function buildSystemPrompt(level, taskType) {
  const guides = getGuides(level)
  const taskGuidance = TASK_TYPE_GUIDANCE[taskType] ?? ''
  return `You are an expert Cambridge ${level.toUpperCase()} examiner and writing teacher.

When an essay is provided, grade it immediately. Do not ask any questions.
Produce the full structured grading report right away.

Every band score must be supported by specific quoted evidence from the essay.
Always quote actual phrases from the student's text to justify your assessments.
Be fair, precise, and constructive. Reference the official band descriptors.
${taskGuidance}

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

export async function gradeEssay({ essayText, level = 'c2', taskType, taskPrompt, model }) {
  const openrouter = getOpenRouter()
  const systemPrompt = buildSystemPrompt(level, taskType)

  let userMessage = `## Task Type\n${taskType}\n\n`
  if (taskPrompt) userMessage += `## Task Prompt\n${taskPrompt}\n\n`
  userMessage += `## Student Essay\n${essayText}`

  const modelId = model || DEFAULT_MODEL

  const { text } = await generateText({
    model: openrouter(modelId),
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
