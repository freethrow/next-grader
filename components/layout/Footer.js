import Link from 'next/link'

const currentYear = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-base-200 bg-base-100 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-base-content/50">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold text-base-content/70">NextGrader</span>
            <span>&copy; {currentYear} Studio Oskar</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <Link href="/grade" className="hover:text-primary transition-colors">Grade Essay</Link>
            <Link href="/students" className="hover:text-primary transition-colors">Students</Link>
            <Link href="/settings" className="hover:text-primary transition-colors">Settings</Link>
          </div>

          {/* Powered by */}
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-medium text-base-content/70">Claude AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
