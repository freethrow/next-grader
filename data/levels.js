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
  c1: {
    label: 'C1 Advanced',
    taskTypes: ['essay', 'article', 'letter', 'report', 'review'],
    wordCounts: {
      essay: { min: 220, max: 260, label: 'Part 1' },
      article: { min: 220, max: 260, label: 'Part 2' },
      letter: { min: 220, max: 260, label: 'Part 2' },
      report: { min: 220, max: 260, label: 'Part 2' },
      review: { min: 220, max: 260, label: 'Part 2' },
    },
    subscales: ['content', 'communicative_achievement', 'organisation', 'language'],
    maxBand: 5,
  },
  b2: {
    label: 'B2 First',
    taskTypes: ['essay', 'article', 'email', 'letter', 'report', 'review'],
    wordCounts: {
      essay: { min: 140, max: 190, label: 'Part 1' },
      article: { min: 140, max: 190, label: 'Part 2' },
      email: { min: 140, max: 190, label: 'Part 2' },
      letter: { min: 140, max: 190, label: 'Part 2' },
      report: { min: 140, max: 190, label: 'Part 2' },
      review: { min: 140, max: 190, label: 'Part 2' },
    },
    subscales: ['content', 'communicative_achievement', 'organisation', 'language'],
    maxBand: 5,
  },
  b1: {
    label: 'B1 Preliminary',
    taskTypes: ['article', 'email', 'letter', 'story'],
    wordCounts: {
      article: { min: 100, max: 150, label: 'Part 1' },
      email: { min: 100, max: 150, label: 'Part 1' },
      letter: { min: 100, max: 150, label: 'Part 1' },
      story: { min: 100, max: 150, label: 'Part 2' },
    },
    subscales: ['content', 'communicative_achievement', 'organisation', 'language'],
    maxBand: 5,
  },
}

export const MODELS = [
  { id: 'google/gemini-flash-3', label: 'Gemini Flash 3', default: true },
  { id: 'google/gemini-pro-3', label: 'Gemini Pro 3' },
]
