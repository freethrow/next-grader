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
    <div>
      {/* Full-viewport video hero — breaks out of layout container */}
      <div
        className="relative h-screen min-h-140 flex items-center justify-center overflow-hidden -mt-8"
        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
      >

        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {firstName ? `Welcome back, ${firstName}` : 'NextGrader'}
          </h1>
          <p className="text-white/80 text-lg max-w-lg mx-auto mb-8 drop-shadow">
            AI-powered Cambridge essay grading. Detailed band scores, examiner commentary, and actionable feedback — in seconds.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {user ? (
              <>
                <Link href="/grade" className="btn btn-primary btn-lg">Grade an Essay</Link>
                <Link href="/students" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-black">View Students</Link>
              </>
            ) : (
              <Link href="/sign-in" className="btn btn-primary btn-lg">Get Started</Link>
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-16">
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
