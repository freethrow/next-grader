'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import EssayList from '@/components/essays/EssayList'
import EssayFilters from '@/components/essays/EssayFilters'
import { LEVELS } from '@/data/levels'
import { formatDate } from '@/lib/utils'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([v, { label }]) => ({ value: v, label }))
const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-surface text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm'
const labelCls = 'block text-sm font-medium text-ink mb-1'

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
      .then(r => r.json())
      .then(d => { setData(d); setEditForm({ name: d.name, email: d.email, notes: d.notes, level: d.level }); setLoading(false) })
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
      if (res.ok) { const updated = await res.json(); setData(prev => ({ ...prev, ...updated })); setEditing(false) }
    } catch {}
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-16"><svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg></div>
  if (!data || data.error) return <div className="text-center py-16 text-muted">Student not found.</div>

  const essays = data.essays ?? []
  const filteredEssays = essays.filter(e => {
    if (filters.level && e.level !== filters.level) return false
    if (filters.task_type && e.task_type !== filters.task_type) return false
    return true
  })
  const avgScore = essays.length ? (essays.reduce((sum, e) => sum + (e.assessment?.scores?.total ?? 0), 0) / essays.length).toFixed(1) : null

  return (
    <div>
      <div className="mb-1 text-sm text-muted">
        <Link href="/students" className="hover:text-primary transition-colors">Students</Link> / {data.name}
      </div>

      <PageHeader
        title={data.name}
        subtitle={`${LEVELS[data.level]?.label ?? data.level?.toUpperCase()} · Added ${formatDate(data.created_at)}`}
        action={<button className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-ink hover:bg-raised transition-colors" onClick={() => setEditing(true)}>Edit</button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Essays graded', value: essays.length },
          { label: 'Average score', value: avgScore ? `${avgScore}/20` : '—' },
          { label: 'Level', value: LEVELS[data.level]?.label ?? data.level?.toUpperCase() },
          { label: 'Email', value: data.email || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-xl shadow-sm p-4">
            <p className="text-xs text-faint">{label}</p>
            <p className="font-semibold text-ink truncate mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-semibold text-ink">Essays ({filteredEssays.length})</h2>
        <EssayFilters filters={filters} onChange={setFilters} />
      </div>

      <EssayList essays={filteredEssays} />

      <div className="mt-4">
        <Link href="/grade" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          + Grade new essay
        </Link>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setEditing(false)} />
          <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
            <button className="absolute right-4 top-4 text-muted hover:text-ink" onClick={() => setEditing(false)}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="font-bold text-lg text-ink mb-4">Edit Student</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className={labelCls}>Name</label><input type="text" className={inputCls} required value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
              <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
              <div><label className={labelCls}>Notes</label><input type="text" className={inputCls} value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} /></div>
              <div><label className={labelCls}>Level</label><select className={inputCls} value={editForm.level || 'c2'} onChange={e => setEditForm({ ...editForm, level: e.target.value })}>{LEVEL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:bg-raised transition-colors" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 flex items-center gap-2">
                  {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
