import Link from 'next/link'

export default function ThankYou() {
  return (
    <main className="min-h-screen bg-rebel-black flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-rebel-red/10 border border-rebel-red/30">
          <svg className="w-8 h-8 text-rebel-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-rebel-red text-xs font-semibold tracking-widest uppercase mb-3">REQUEST RECEIVED</p>
        <h1 className="text-white font-bold text-3xl uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Thanks. I&apos;ll be in touch.
        </h1>
        <p className="text-white/70 text-base leading-relaxed mb-8">
          I&apos;ve got your audit results and contact details. I&apos;ll review everything and come back to you within 24 hours.
        </p>
        <p className="text-white/50 text-sm mb-10">Dan Langrish, Rebel Marketer</p>
        <Link href="/"
          className="inline-flex items-center gap-2 bg-rebel-red text-white font-bold rounded-full px-6 py-3 text-sm hover:bg-rebel-red/90 transition-colors uppercase tracking-wide"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Audit Another Site
        </Link>
      </div>
    </main>
  )
}
