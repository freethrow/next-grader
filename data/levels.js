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
  { id: 'google/gemini-flash-3', label: 'Gemini Flash 3', default: true },
  { id: 'google/gemini-pro-3', label: 'Gemini Pro 3' },
]
