import Link from 'next/link'
import { LEVELS } from '@/data/levels'

export default function StudentList({ students }) {
  if (!students?.length) {
    return (
      <div className="text-center py-16 text-muted">
        <svg className="w-10 h-10 mx-auto mb-3 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="font-medium">No students yet</p>
        <p className="text-sm mt-1">Add your first student to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-raised">
            <th className="text-left px-4 py-3 font-semibold text-ink">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-ink hidden sm:table-cell">Level</th>
            <th className="text-center px-4 py-3 font-semibold text-ink">Essays</th>
            <th className="text-center px-4 py-3 font-semibold text-ink hidden sm:table-cell">Avg Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => (
            <tr key={student._id} className="hover:bg-raised transition-colors cursor-pointer">
              <td className="px-4 py-3 font-medium text-ink">
                <Link href={`/students/${student._id}`} className="block w-full">
                  {student.name}
                  {student.notes && (
                    <p className="text-xs text-faint font-normal mt-0.5 line-clamp-1">{student.notes}</p>
                  )}
                </Link>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <Link href={`/students/${student._id}`} className="block w-full">
                  <span className="text-xs font-semibold bg-primary-tint text-primary px-2 py-0.5 rounded">
                    {LEVELS[student.level]?.label ?? student.level?.toUpperCase()}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-center text-muted">
                <Link href={`/students/${student._id}`} className="block w-full">
                  {student.essayCount ?? 0}
                </Link>
              </td>
              <td className="px-4 py-3 text-center hidden sm:table-cell">
                <Link href={`/students/${student._id}`} className="block w-full">
                  {student.avgScore != null
                    ? <span className="font-semibold text-ink">{student.avgScore.toFixed(1)}<span className="text-faint font-normal">/20</span></span>
                    : <span className="text-faint">—</span>
                  }
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
