import { c2Prompt } from './c2'

const prompts = {
  c2: c2Prompt,
  // c1: c1Prompt,  — add when lib/prompts/c1.js is created
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
