import EssayCard from './EssayCard'

export default function EssayList({ essays }) {
  if (!essays?.length) {
    return (
      <div className="text-center py-12 text-base-content/40">
        <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-medium">No essays yet</p>
        <p className="text-sm mt-1">Grade an essay to see it here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {essays.map((essay) => (
        <EssayCard key={essay._id} essay={essay} />
      ))}
    </div>
  )
}
