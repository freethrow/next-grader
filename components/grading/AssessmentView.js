import BandScoreTable from './BandScoreTable'
import FeedbackSection from './FeedbackSection'
import Link from 'next/link'

export default function AssessmentView({ essay }) {
  if (!essay?.assessment) return null
  const { assessment } = essay

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Assessment Result</h2>
          {assessment.inferred_title && (
            <p className="text-base font-medium text-muted mt-0.5 italic">
              &ldquo;{assessment.inferred_title}&rdquo;
            </p>
          )}
          {assessment.cefr_indication && (
            <p className="text-sm font-semibold text-primary mt-1">{assessment.cefr_indication}</p>
          )}
        </div>
        {essay._id && (
          <Link href={`/essays/${essay._id}`} className="shrink-0 px-4 py-2 rounded-lg border border-border text-sm font-medium text-ink hover:bg-raised transition-colors">
            View Full Assessment →
          </Link>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-ink mb-3">Band Scores</h3>
        <BandScoreTable scores={assessment.scores} />
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
        <FeedbackSection assessment={assessment} />
      </div>
    </div>
  )
}
