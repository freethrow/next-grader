'use client'
import { LEVELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([v, { label }]) => ({ value: v, label }))

export default function EssayFilters({ filters, onChange }) {
  const taskTypes = ['essay', 'article', 'letter', 'report', 'review']

  function update(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select
        className="select select-sm select-bordered"
        value={filters.level || ''}
        onChange={(e) => update('level', e.target.value)}
      >
        <option value="">All levels</option>
        {LEVEL_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <select
        className="select select-sm select-bordered"
        value={filters.task_type || ''}
        onChange={(e) => update('task_type', e.target.value)}
      >
        <option value="">All task types</option>
        {taskTypes.map((t) => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>
    </div>
  )
}
