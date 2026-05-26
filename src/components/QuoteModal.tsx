'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AuditResult } from '@/lib/types'

interface QuoteModalProps {
  audit: AuditResult
  onClose: () => void
}

export default function QuoteModal({ audit, onClose }: QuoteModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const buildReportText = () => {
    const sections = [
      { title: 'TECHNICAL', score: audit.technical_score, checks: audit.checks.technical },
      { title: 'ON-PAGE', score: audit.onpage_score, checks: audit.checks.onpage },
      { title: 'CONTENT', score: audit.content_score, checks: audit.checks.content },
      { title: 'AUTHORITY', score: audit.authority_score, checks: audit.checks.authority },
    ]
    const lines: string[] = [
      'REBEL SEO AUDIT — FULL REPORT',
      `URL: ${audit.url}`,
      `Overall Score: ${audit.overall_score}/100`,
      `Scanned: ${new Date(audit.created_at).toLocaleString('en-GB')}`,
      '',
    ]
    for (const section of sections) {
      lines.push(`-- ${section.title} (${section.score}/25) --`)
      for (const check of section.checks) {
        const tag = check.status === 'good' ? '[GOOD]' : check.status === 'critical' ? '[CRITICAL]' : '[NEEDS WORK]'
        lines.push(`${tag} ${check.name}`)
        lines.push(`  ${check.detail}`)
        if (check.fix) lines.push(`  FIX: ${check.fix}`)
      }
      lines.push('')
    }
    return lines.join('\n')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'bbcf6a05-1375-403a-ba94-24b53925f537',
          subject: `New SEO audit quote request: ${audit.url} — ${audit.overall_score}/100`,
          name: name || 'Not provided',
          email,
          phone,
          url_audited: audit.url,
          overall_score: `${audit.overall_score}/100`,
          technical: `${audit.technical_score}/25`,
          onpage: `${audit.onpage_score}/25`,
          content: `${audit.content_score}/25`,
          authority: `${audit.authority_score}/25`,
          message: buildReportText(),
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Submission failed')
      router.push('/thank-you')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#160c0c] border border-[rgba(192,57,43,0.4)] rounded-[14px] p-8 w-full max-w-md">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-rebel-red text-xs font-semibold tracking-widest uppercase mb-1">FREE CONSULTATION</p>
            <h2 className="text-white font-bold text-2xl uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Get a Quote
            </h2>
            <p className="text-white/70 text-sm mt-1">I&apos;ll review your results and get back to you within 24 hours.</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors ml-4 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-black/30 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <span className="text-white/60 text-xs uppercase tracking-wide">Audit result attached</span>
          <span className="text-rebel-red font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {audit.overall_score}/100
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wide mb-1.5">
              Name <span className="text-white/40 normal-case tracking-normal">(optional)</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-rebel-red/50 transition-colors" />
          </div>
          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wide mb-1.5">
              Email <span className="text-rebel-red">*</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourcompany.com" required
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-rebel-red/50 transition-colors" />
          </div>
          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wide mb-1.5">
              Phone <span className="text-rebel-red">*</span>
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7700 000000" required
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-rebel-red/50 transition-colors" />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading || !email.trim() || !phone.trim()}
            className="w-full bg-rebel-red text-white font-bold rounded-lg px-5 py-3 text-sm hover:bg-rebel-red/90 transition-colors disabled:opacity-50 uppercase tracking-wide mt-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {loading ? 'SENDING...' : 'SEND MY RESULTS'}
          </button>
        </form>
      </div>
    </div>
  )
}
