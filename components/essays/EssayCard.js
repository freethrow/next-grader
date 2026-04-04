import Link from 'next/link'
import { formatDate, capitalize } from '@/lib/utils'

function scoreColor(total) {
  if (total <= 5)  return 'bg-red-light text-red'
  if (total <= 10) return 'bg-amber-light text-amber'
  if (total <= 15) return 'bg-green-light text-green'
  return 'bg-primary-tint text-primary'
}

export default function EssayCard({ essay }) {
  const scores = essay.assessment?.scores
  const title = essay.assessment?.inferred_title
  const preview = essay.essay_text?.slice(0, 100)

  return (
    <Link href={`/essays/${essay._id}`} className="block">
      <div className="bg-surface border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-primary-tint text-primary px-2 py-0.5 rounded">
              {essay.level?.toUpperCase()}
            </span>
            <span className="text-xs font-semibold bg-raised text-muted px-2 py-0.5 rounded">
              {capitalize(essay.task_type)}
            </span>
          </div>
          {scores && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${scoreColor(scores.total)}`}>
              {scores.total}/20
            </span>
          )}
        </div>
        {title ? (
          <p className="text-sm font-medium text-ink italic">&ldquo;{title}&rdquo;</p>
        ) : preview ? (
          <p className="text-sm text-muted line-clamp-2">
            {preview}{essay.essay_text?.length > 100 ? '…' : ''}
          </p>
        ) : null}
        <div className="flex items-center gap-3 mt-2 text-xs text-faint">
          <span>{formatDate(essay.created_at)}</span>
          {essay.word_count && <span>{essay.word_count} words</span>}
        </div>
      </div>
    </Link>
  )
}
