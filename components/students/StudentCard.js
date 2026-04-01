import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import { LEVELS } from '@/data/levels'

export default function StudentCard({ student }) {
  const router = useRouter()
  const levelLabel = LEVELS[student.level]?.label ?? student.level?.toUpperCase()

  return (
    <div
      className="card bg-base-100 border border-base-200 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
      onClick={() => router.push(`/students/${student._id}`)}
    >
      <div className="card-body p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight">{student.name}</h3>
          <Badge variant="level">{levelLabel}</Badge>
        </div>
        {student.email && (
          <p className="text-sm text-base-content/50">{student.email}</p>
        )}
        {student.notes && (
          <p className="text-sm text-base-content/60 line-clamp-2">{student.notes}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-base-content/50">
          <span>{student.essayCount ?? 0} essays</span>
          {student.avgScore != null && (
            <span>Avg: <strong className="text-base-content">{student.avgScore.toFixed(1)}</strong>/20</span>
          )}
        </div>
      </div>
    </div>
  )
}
