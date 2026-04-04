import { capitalize } from '@/lib/utils'

const SUBSCALES = ['content', 'communicative_achievement', 'organisation', 'language']

export default function FeedbackSection({ assessment }) {
  if (!assessment) return null
  const { commentary, strengths, areas_for_development, key_errors } = assessment

  return (
    <div className="space-y-6">
      {/* Examiner commentary */}
      <div>
        <h3 className="font-semibold text-ink mb-3">Examiner Commentary</h3>
        <div className="space-y-3">
          {SUBSCALES.map((key) =>
            commentary?.[key] ? (
              <div key={key} className="border-l-3 border-primary pl-3 bg-primary-tint rounded-r-lg py-3 pr-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                  {capitalize(key)}
                </p>
                <p className="text-sm text-ink leading-relaxed">{commentary[key]}</p>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Strengths */}
      {strengths?.length > 0 && (
        <div>
          <h3 className="font-semibold text-green mb-2">Strengths</h3>
          <ul className="space-y-1.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-green mt-0.5 shrink-0">✓</span>
                <span className="text-ink">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for development */}
      {areas_for_development?.length > 0 && (
        <div>
          <h3 className="font-semibold text-amber mb-2">Areas for Development</h3>
          <ul className="space-y-1.5">
            {areas_for_development.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-amber mt-0.5 shrink-0">→</span>
                <span className="text-ink">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key errors */}
      {key_errors && Object.keys(key_errors).length > 0 && (
        <div>
          <h3 className="font-semibold text-red mb-2">Key Errors</h3>
          <div className="space-y-3">
            {Object.entries(key_errors).map(([category, examples]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                  {capitalize(category)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {examples.map((ex, i) => (
                    <span key={i} className="text-xs font-mono bg-red-light text-red rounded px-2 py-0.5">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
