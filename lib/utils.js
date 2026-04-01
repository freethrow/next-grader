export function formatDate(date, options = {}) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function calculateTotalScore(scores) {
  if (!scores) return 0
  const { content = 0, communicative_achievement = 0, organisation = 0, language = 0 } = scores
  return content + communicative_achievement + organisation + language
}

export function countWords(text) {
  if (!text || !text.trim()) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

export function scoreColor(score) {
  if (score <= 1) return 'text-error'
  if (score === 2) return 'text-warning'
  if (score === 3) return 'text-success'
  return 'text-accent'
}
