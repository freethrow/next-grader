import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'

export const metadata = { title: 'Verbiq — Cambridge Essay Assessment' }

export default async function HomePage() {
  let user = null
  try {
    const { userId } = await auth()
    if (userId) user = await currentUser()
  } catch { }

  return (
    <div>
      {/* Full-viewport video hero */}
      <div
        className="relative h-screen min-h-140 flex items-center justify-center overflow-hidden -mt-8"
        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0" style={{ background: 'rgba(26,43,60,0.45)' }} />
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto border-2 border-white/20 rounded-3xl py-10 backdrop-blur-sm">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Verbiq
          </h1>
          <p className="text-white/80 text-lg max-w-lg mx-auto mb-8 drop-shadow">
            AI-powered Cambridge essay grading. Detailed band scores, examiner commentary, and actionable feedback — in seconds.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {user ? (
              <>
                <Link href="/grade" className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity">Grade an Essay</Link>
                <Link href="/students" className="px-6 py-3 rounded-lg border border-white/60 text-white font-semibold hover:bg-white/10 transition-colors">View Students</Link>
              </>
            ) : (
              <Link href="/sign-in" className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity">Get Started</Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Features */}
      <div
        className="py-20 px-6 -mb-8"
        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', background: '#1A2B3C' }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">Built for the classroom and the exam hall</p>
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-white mb-2">
            Examiner-grade feedback. Instantly.
          </h2>
          <p className="text-center text-white/50 max-w-xl mx-auto mb-12 text-sm">
            For teachers who need to give fast, accurate written feedback — and for students who refuse to leave their Cambridge result to chance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'For teachers',
                title: 'Real examiner standards, not AI guesswork',
                desc: 'Graded against the official Cambridge band descriptors for C2, C1, B2 and B1. Every score is backed by quoted evidence from the student\'s own writing.',
              },
              {
                label: 'For students',
                title: 'Know exactly where marks are lost',
                desc: 'Per-subscale commentary on Content, Communicative Achievement, Organisation and Language — the four areas that decide your Cambridge grade.',
              },
              {
                label: 'Track improvement',
                title: 'Progress over time, not just one snapshot',
                desc: 'Every essay is saved to the student\'s profile. Teachers can monitor score trends across sessions and pinpoint patterns before exam day.',
              },
            ].map(({ label, title, desc }) => (
              <div key={title} className="border border-white/10 rounded-2xl p-6 hover:border-white/25 transition-colors">
                <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">{label}</p>
                <h3 className="font-semibold text-white mb-2 leading-snug">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
