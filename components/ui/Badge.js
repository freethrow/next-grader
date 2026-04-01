/**
 * Band score badge.
 * variant: 'level' | 'task' | 'score' | 'default'
 * For score variant, pass score (0–5) and it auto-colors.
 */
export default function Badge({ children, variant = 'default', score, className = '' }) {
  let colorClass = 'badge-neutral'

  if (variant === 'score' && score !== undefined) {
    if (score <= 1) colorClass = 'badge-error'
    else if (score === 2) colorClass = 'badge-warning'
    else if (score === 3) colorClass = 'badge-success'
    else colorClass = 'badge-accent' // 4–5 dark green / accent
  } else if (variant === 'level') {
    colorClass = 'badge-primary'
  } else if (variant === 'task') {
    colorClass = 'badge-secondary'
  }

  return (
    <span className={`badge badge-sm font-semibold ${colorClass} ${className}`}>
      {children}
    </span>
  )
}
