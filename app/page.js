import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'

export const metadata = { title: 'NextGrader — Cambridge Essay Assessment' }

export default async function HomePage() {
  let user = null
  try {
    const { userId } = await auth()
    if (userId) user = await currentUser()
  } catch {}

  const firstName = user?.firstName ?? null

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {firstName ? `Welcome back, ${firstName}` : 'Welcome to NextGrader'}
        </h1>
        <p className="text-base-content/60 max-w-md mx-auto">
          AI-powered Cambridge essay grading. Detailed band scores, examiner commentary, and actionable feedback — in seconds.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {user ? (
            <>
              <Link href="/grade" className="btn btn-primary btn-lg">Grade an Essay</Link>
              <Link href="/students" className="btn btn-outline btn-lg">View Students</Link>
            </>
          ) : (
            <Link href="/sign-in" className="btn btn-primary btn-lg">Get Started</Link>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '🎯',
            title: 'Calibrated Assessment',
            desc: 'Full Cambridge band descriptors with anti-inflation calibration principles for accurate, examiner-standard scores.',
          },
          {
            icon: '📝',
            title: 'Detailed Commentary',
            desc: 'Per-subscale examiner commentary referencing specific passages of the essay, not generic feedback.',
          },
          {
            icon: '📊',
            title: 'Track Progress',
            desc: "All assessments saved to each student's profile. Monitor trends, compare essays, and measure growth over time.",
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-6">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-base-content/60">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
