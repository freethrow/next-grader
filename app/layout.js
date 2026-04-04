import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata = {
  title: 'Verbiq — Cambridge Essay Assessment',
  description: 'AI-powered Cambridge exam essay grading — Verbiq',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-canvas text-ink" suppressHydrationWarning>
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
