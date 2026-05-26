'use client'

import { useState } from 'react'
import type { AuditResult } from '@/lib/types'

interface AuditResultHeaderProps {
  audit: AuditResult
  onGetQuote: () => void
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-400'
  if (score >= 50) return 'text-orange-400'
  return 'text-rebel-red'
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

export default function AuditResultHeader({ audit, onGetQuote }: AuditResultHeaderProps) {
  const [pdfLoading, setPdfLoading] = useState(false)

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    try {
      const { generatePDF } = await import('@/lib/generatePDF')
      await generatePDF(audit)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rebel-audit-${getDomain(audit.url)}-${audit.id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pillars = [
    { label: 'TECHNICAL', score: audit.technical_score },
    { label: 'ON-PAGE', score: audit.onpage_score },
    { label: 'CONTENT', score: audit.content_score },
    { label: 'AUTHORITY', score: audit.authority_score },
  ]

  return (
    <div className="bg-[#160c0c] border border-[rgba(192,57,43,0.3)] rounded-[14px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-rebel-red text-xs font-semibold tracking-widest uppercase mb-2">AUDITED</p>
          <h1 className="text-white font-bold text-2xl uppercase leading-tight break-all"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {getDomain(audit.url)}
          </h1>
          <p className="text-white/60 text-xs mt-1">{audit.url}</p>
          <p className="text-white/50 text-xs mt-1">{formatTimestamp(audit.created_at)}</p>

          <div className="flex flex-wrap gap-3 mt-3">
            {pillars.map(p => (
              <div key={p.label} className="flex items-baseline gap-1">
                <span className="text-white/40 text-[10px] uppercase tracking-widest">{p.label}</span>
                <span className={`font-bold text-sm ${getScoreColor(p.score * 4)}`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {p.score}
                </span>
                <span className="text-white/30 text-[10px]">/25</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button onClick={onGetQuote}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-rebel-red hover:bg-rebel-red/90 transition-colors rounded-full px-4 py-1.5 uppercase tracking-wide"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              GET A QUOTE
            </button>
            <button onClick={handleDownloadPDF} disabled={pdfLoading}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-rebel-red transition-colors border border-white/10 hover:border-rebel-red/30 rounded-full px-3 py-1.5 disabled:opacity-50">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pdfLoading ? 'GENERATING...' : 'DOWNLOAD PDF'}
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-rebel-red transition-colors border border-white/10 hover:border-rebel-red/30 rounded-full px-3 py-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              EXPORT JSON
            </button>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Overall</p>
          <p className={`font-bold text-5xl leading-none ${getScoreColor(audit.overall_score)}`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {audit.overall_score}
          </p>
          <p className="text-white/50 text-sm">/100</p>
        </div>
      </div>
    </div>
  )
}
