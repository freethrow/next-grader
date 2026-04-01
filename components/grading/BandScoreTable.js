import Badge from '@/components/ui/Badge'
import { capitalize } from '@/lib/utils'

const SUBSCALES = ['content', 'communicative_achievement', 'organisation', 'language']

export default function BandScoreTable({ scores }) {
  if (!scores) return null

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr>
            <th className="text-left">Subscale</th>
            <th className="text-center">Band</th>
            <th className="text-center w-32">Score bar</th>
          </tr>
        </thead>
        <tbody>
          {SUBSCALES.map((key) => {
            const score = scores[key] ?? 0
            return (
              <tr key={key}>
                <td className="font-medium">{capitalize(key)}</td>
                <td className="text-center">
                  <Badge variant="score" score={score}>{score}</Badge>
                </td>
                <td>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`h-3 w-5 rounded-sm ${
                          n <= score
                            ? score <= 1 ? 'bg-error'
                              : score === 2 ? 'bg-warning'
                              : score === 3 ? 'bg-success'
                              : 'bg-accent'
                            : 'bg-base-200'
                        }`}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="font-bold text-base">
            <td>Total</td>
            <td className="text-center">{scores.total ?? 0} / 20</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
