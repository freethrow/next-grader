import { capitalize } from '@/lib/utils'

const SUBSCALES = ['content', 'communicative_achievement', 'organisation', 'language']

function scoreStyle(score) {
  if (score <= 1) return { text: 'text-red',   bar: 'bg-red' }
  if (score === 2) return { text: 'text-amber', bar: 'bg-amber' }
  if (score === 3) return { text: 'text-green', bar: 'bg-green' }
  return                  { text: 'text-primary', bar: 'bg-primary' }
}

export default function BandScoreTable({ scores }) {
  if (!scores) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-faint text-xs uppercase tracking-wide">
            <th className="text-left pb-2 font-semibold">Subscale</th>
            <th className="text-center pb-2 font-semibold">Band</th>
            <th className="text-center pb-2 font-semibold w-32">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {SUBSCALES.map((key) => {
            const score = scores[key] ?? 0
            const { text, bar } = scoreStyle(score)
            return (
              <tr key={key}>
                <td className="py-2.5 font-medium text-ink">{capitalize(key)}</td>
                <td className={`py-2.5 text-center font-bold text-lg ${text}`}>{score}</td>
                <td className="py-2.5">
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`h-2.5 w-5 rounded-sm transition-colors ${n <= score ? bar : 'bg-raised'}`}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border">
            <td className="pt-3 font-bold text-ink">Total</td>
            <td className="pt-3 text-center font-bold text-lg text-ink">{scores.total ?? 0}<span className="text-faint font-normal text-sm">/20</span></td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
