import BandScoreTable from './BandScoreTable'
import FeedbackSection from './FeedbackSection'
import Link from 'next/link'

export default function AssessmentView({ essay }) {
  if (!essay?.assessment) return null

  const { assessment } = essay

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Assessment Result</h2>
          {assessment.inferred_title && (
            <p className="text-base font-medium text-base-content/80 mt-0.5 italic">
              &ldquo;{assessment.inferred_title}&rdquo;
            </p>
          )}
          {assessment.cefr_indication && (
            <p className="text-base-content/60 text-sm mt-1">
              CEFR indication: <span className="font-semibold text-primary">{assessment.cefr_indication}</span>
            </p>
          )}
        </div>
        {essay._id && (
          <Link href={`/essays/${essay._id}`} className="btn btn-outline btn-sm shrink-0">
            View Full Assessment →
          </Link>
        )}
      </div>

      {/* Band scores */}
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-5">
          <h3 className="font-semibold mb-3">Band Scores</h3>
          <BandScoreTable scores={assessment.scores} />
        </div>
      </div>

      {/* Feedback */}
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-5">
          <FeedbackSection assessment={assessment} />
        </div>
      </div>
    </div>
  )
}
