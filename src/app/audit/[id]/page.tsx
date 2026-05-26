'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuditForm from '@/components/AuditForm'
import AuditResultHeader from '@/components/AuditResultHeader'
import PillarCard from '@/components/PillarCard'
import QuoteModal from '@/components/QuoteModal'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { AuditResult } from '@/lib/types'

export default function AuditPage() {
  const params = useParams()
  const router = useRouter()
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [showQuote, setShowQuote] = useState(false)

  useEffect(() => {
    const id = params.id as string
    const stored = sessionStorage.getItem(`audit-${id}`)
    if (!stored) { router.replace('/'); return }
    setAudit(JSON.parse(stored))
  }, [params.id, router])

  if (!audit) return null

  return (
    <main className="min-h-screen bg-rebel-black">
      <header className="sticky top-0 z-50 bg-rebel-black border-b border-rebel-darkred/20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
            <span className="font-bold text-white text-xl uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              REBEL
            </span>
            <span className="text-rebel-red text-xs font-semibold tracking-widest uppercase">
              SEO AUDIT
            </span>
          </Link>
          <AuditForm />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/" className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6 w-fit transition-colors">
          NEW AUDIT
        </Link>
        <div className="space-y-4 max-w-2xl">
          <AuditResultHeader audit={audit} onGetQuote={() => setShowQuote(true)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PillarCard title="TECHNICAL" subtitle="Can search engines crawl and index this page?"
              score={audit.technical_score} maxScore={25} checks={audit.checks.technical} />
            <PillarCard title="ON-PAGE" subtitle="Are the core on-page signals in place?"
              score={audit.onpage_score} maxScore={25} checks={audit.checks.onpage} />
            <PillarCard title="CONTENT" subtitle="Is the content structured and substantial?"
              score={audit.content_score} maxScore={25} checks={audit.checks.content} />
            <PillarCard title="AUTHORITY" subtitle="Are trust and authority signals present?"
              score={audit.authority_score} maxScore={25} checks={audit.checks.authority} />
          </div>
        </div>
      </div>

      <Footer />

      {showQuote && <QuoteModal audit={audit} onClose={() => setShowQuote(false)} />}
    </main>
  )
}
