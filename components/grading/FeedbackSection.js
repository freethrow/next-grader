import { capitalize } from '@/lib/utils'

const SUBSCALES = ['content', 'communicative_achievement', 'organisation', 'language']

export default function FeedbackSection({ assessment }) {
  if (!assessment) return null
  const { commentary, strengths, areas_for_development, key_errors } = assessment

  return (
    <div className="space-y-6">
      {/* Examiner commentary */}
      <div>
        <h3 className="font-semibold text-base mb-3">Examiner Commentary</h3>
        <div className="space-y-3">
          {SUBSCALES.map((key) => (
            commentary?.[key] ? (
              <div key={key} className="bg-base-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                  {capitalize(key)}
                </p>
                <p className="text-sm text-base-content/80 leading-relaxed">{commentary[key]}</p>
              </div>
            ) : null
          ))}
        </div>
      </div>

      {/* Strengths */}
      {strengths?.length > 0 && (
        <div>
          <h3 className="font-semibold text-base mb-2 text-success">Strengths</h3>
          <ul className="space-y-1.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-success mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for development */}
      {areas_for_development?.length > 0 && (
        <div>
          <h3 className="font-semibold text-base mb-2 text-warning">Areas for Development</h3>
          <ul className="space-y-1.5">
            {areas_for_development.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-warning mt-0.5">→</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key errors */}
      {key_errors && Object.keys(key_errors).length > 0 && (
        <div>
          <h3 className="font-semibold text-base mb-2 text-error">Key Errors</h3>
          <div className="space-y-2">
            {Object.entries(key_errors).map(([category, examples]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                  {capitalize(category)}
                </p>
                <ul className="space-y-1">
                  {examples.map((ex, i) => (
                    <li key={i} className="text-sm font-mono bg-error/10 text-error rounded px-2 py-0.5 inline-block mr-2">
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
