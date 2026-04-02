import Link from 'next/link'
import { formatDate, capitalize } from '@/lib/utils'

function scoreBadgeClass(score) {
  if (score <= 5) return 'badge-error'
  if (score <= 10) return 'badge-warning'
  if (score <= 15) return 'badge-success'
  return 'badge-accent'
}

export default function EssayCard({ essay }) {
  const scores = essay.assessment?.scores
  const title = essay.assessment?.inferred_title
  const preview = essay.essay_text?.slice(0, 100)

  return (
    <Link href={`/essays/${essay._id}`} className="block">
      <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
        <div className="card-body p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-primary badge-sm font-semibold">{essay.level?.toUpperCase()}</span>
              <span className="badge badge-secondary badge-sm font-semibold">{capitalize(essay.task_type)}</span>
            </div>
            {scores && (
              <span className={`badge badge-sm font-semibold ${scoreBadgeClass(scores.total)}`}>
                {scores.total}/20
              </span>
            )}
          </div>
          {title ? (
            <p className="text-sm font-medium text-base-content/80 italic mt-2">&ldquo;{title}&rdquo;</p>
          ) : preview ? (
            <p className="text-sm text-base-content/60 line-clamp-2 mt-2">
              {preview}{essay.essay_text?.length > 100 ? '…' : ''}
            </p>
          ) : null}
          <div className="flex items-center gap-3 mt-2 text-xs text-base-content/40">
            <span>{formatDate(essay.created_at)}</span>
            {essay.word_count && <span>{essay.word_count} words</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
