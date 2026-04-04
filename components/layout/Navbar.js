'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs'

const baseLinks = [
  { href: '/grade', label: 'Grade Essay' },
  { href: '/students', label: 'Students' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/settings').then(r => { if (r.ok) setIsAdmin(true) }).catch(() => { })
  }, [isSignedIn])

  const navLinks = isAdmin ? [...baseLinks, { href: '/settings', label: 'Settings' }] : baseLinks

  function isActive(href) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-sm print-hidden">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-2">

        <div className="flex-1">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg text-white hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Verbiq
          </Link>
        </div>

        {isSignedIn && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive(href)
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 ml-2">
          {isSignedIn ? (
            <>
              <UserButton afterSignOutUrl="/" />
              <button
                className="md:hidden p-1.5 rounded-md text-white/70 hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-1.5 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {isSignedIn && menuOpen && (
        <div className="md:hidden bg-navy border-b border-white/10 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(href) ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
