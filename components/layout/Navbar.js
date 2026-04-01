'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs'

const navLinks = [
  { href: '/grade', label: 'Grade Essay' },
  { href: '/students', label: 'Students' },
  { href: '/settings', label: 'Settings' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  function isActive(href) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto w-full px-4 flex items-center gap-2">

        {/* Logo / Brand */}
        <div className="flex-1">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>NextGrader</span>
          </Link>
        </div>

        {/* Desktop nav links — only when signed in */}
        {isSignedIn && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`btn btn-sm btn-ghost ${isActive(href) ? 'btn-active font-semibold' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Auth section */}
        <div className="flex items-center gap-2 ml-2">
          {isSignedIn ? (
            <>
              <UserButton afterSignOutUrl="/" />
              {/* Mobile hamburger */}
              <button
                className="btn btn-ghost btn-sm md:hidden"
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
              <button className="btn btn-primary btn-sm">Sign In</button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isSignedIn && menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-base-100 border-b border-base-200 shadow-md z-40">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`btn btn-ghost justify-start ${isActive(href) ? 'btn-active font-semibold' : ''}`}
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
