import { buildPrompt as buildC2Prompt } from './c2.js'

const BUILDERS = {
  c2: buildC2Prompt,
  // c1: buildC1Prompt,  — add when lib/prompts/c1.js is created
  // b2: buildB2Prompt,
}

export function getPromptForLevel(level, taskType) {
  const builder = BUILDERS[level]
  if (!builder) throw new Error(`No prompt configured for level: ${level}`)
  return builder(taskType)
}

export function getAvailableLevels() {
  return Object.keys(BUILDERS)
}
