'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import EssayList from '@/components/essays/EssayList'
import EssayFilters from '@/components/essays/EssayFilters'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { LEVELS } from '@/data/levels'
import { formatDate, calculateTotalScore } from '@/lib/utils'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([v, { label }]) => ({ value: v, label }))

export default function StudentPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setEditForm({ name: d.name, email: d.email, notes: d.notes, level: d.level })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const updated = await res.json()
        setData((prev) => ({ ...prev, ...updated }))
        setEditing(false)
      }
    } catch {}
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg" /></div>
  if (!data || data.error) return <div className="text-center py-16 text-base-content/40">Student not found.</div>

  const essays = data.essays ?? []
  const filteredEssays = essays.filter((e) => {
    if (filters.level && e.level !== filters.level) return false
    if (filters.task_type && e.task_type !== filters.task_type) return false
    return true
  })

  const avgScore = essays.length
    ? (essays.reduce((sum, e) => sum + (e.assessment?.scores?.total ?? 0), 0) / essays.length).toFixed(1)
    : null

  return (
    <div>
      <div className="mb-1 text-sm text-base-content/50">
        <Link href="/students" className="hover:text-primary">Students</Link> / {data.name}
      </div>

      <PageHeader
        title={data.name}
        subtitle={`${LEVELS[data.level]?.label ?? data.level?.toUpperCase()} · Added ${formatDate(data.created_at)}`}
        action={<Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Essays graded', value: essays.length },
          { label: 'Average score', value: avgScore ? `${avgScore}/20` : '—' },
          { label: 'Level', value: LEVELS[data.level]?.label ?? data.level?.toUpperCase() },
          { label: 'Email', value: data.email || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-4">
              <p className="text-xs text-base-content/50">{label}</p>
              <p className="font-semibold truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + essays */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-semibold">Essays ({filteredEssays.length})</h2>
        <EssayFilters filters={filters} onChange={setFilters} />
      </div>

      <EssayList essays={filteredEssays} />

      <div className="mt-4">
        <Link href={`/grade`} className="btn btn-primary btn-sm">+ Grade new essay</Link>
      </div>

      {/* Edit modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Student">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
          <Input label="Email" type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <Input label="Notes" value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
          <Select label="Level" options={LEVEL_OPTIONS} value={editForm.level || 'c2'} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} />
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
