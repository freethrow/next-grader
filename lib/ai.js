import { generateText } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import { getPromptForLevel } from './prompts/index.js'

const DEFAULT_MODEL = 'google/gemini-3.1-pro-preview'

// ---------------------------------------------------------------------------
// Zod schema — validates the JSON the model returns
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
// JSON extraction — handles common model output quirks
// ---------------------------------------------------------------------------

function extractJson(text) {
  // 1. Strip markdown code fences
  let s = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  // 2. Try direct parse first (fast path)
  try { return JSON.parse(s) } catch {}

  // 3. Remove JS-style single-line and block comments
  s = s.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')

  // 4. Remove trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, '$1')

  try { return JSON.parse(s) } catch {}

  // 5. Extract the outermost {...} block in case the model added surrounding text
  const match = s.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
    // One more pass of comma cleanup on the extracted block
    const fixed = match[0].replace(/,(\s*[}\]])/g, '$1')
    return JSON.parse(fixed)
  }

  throw new SyntaxError('Could not extract valid JSON from model response')
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function gradeEssay({ essayText, level = 'c2', taskType, taskPrompt, model }) {
  const openrouter = getOpenRouter()
  const systemPrompt = getPromptForLevel(level, taskType)

  let userMessage = `## Task Type\n${taskType}\n\n`
  if (taskPrompt) userMessage += `## Task Prompt\n${taskPrompt}\n\n`
  userMessage += `## Student Essay\n${essayText}`

  const modelId = model || DEFAULT_MODEL

  const { text } = await generateText({
    model: openrouter(modelId),
    system: systemPrompt,
    prompt: userMessage,
    temperature: 0,
  })

  const parsed = extractJson(text)
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
