import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { formatDate, capitalize } from '@/lib/utils'

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
              <Badge variant="level">{essay.level?.toUpperCase()}</Badge>
              <Badge variant="task">{capitalize(essay.task_type)}</Badge>
            </div>
            {scores && (
              <Badge variant="score" score={Math.round(scores.total / 4)}>
                {scores.total}/20
              </Badge>
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
