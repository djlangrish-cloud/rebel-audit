'use client'

import { useState } from 'react'
import type { Check } from '@/lib/types'
import CheckItem from './CheckItem'

interface PillarCardProps {
  title: string
  subtitle: string
  score: number
  maxScore: number
  checks: Check[]
}

function getScoreColor(score: number, max: number): string {
  const pct = (score / max) * 100
  if (pct >= 75) return 'text-green-400'
  if (pct >= 50) return 'text-orange-400'
  return 'text-rebel-red'
}

export default function PillarCard({ title, subtitle, score, maxScore, checks }: PillarCardProps) {
  const [open, setOpen] = useState(true)
  const criticals = checks.filter(c => c.status === 'critical').length
  const needsWork = checks.filter(c => c.status === 'needs_work').length

  return (
    <div className="bg-[#160c0c] border border-[rgba(192,57,43,0.3)] rounded-[14px] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div>
          <p className="text-rebel-red text-xs font-semibold tracking-widest uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {title}
          </p>
          <p className="text-white/75 text-xs mt-0.5">{subtitle}</p>
          {(criticals > 0 || needsWork > 0) && (
            <div className="flex items-center gap-2 mt-1.5">
              {criticals > 0 && (
                <span className="text-rebel-red text-[10px] font-bold">{criticals} critical</span>
              )}
              {needsWork > 0 && (
                <span className="text-orange-400 text-[10px]">{needsWork} to fix</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className={`font-bold text-3xl leading-none ${getScoreColor(score, maxScore)}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {score}
            </span>
            <span className="text-white/60 text-xs">/{maxScore}</span>
          </div>
          <svg className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          {checks.map((check, i) => <CheckItem key={i} check={check} />)}
        </div>
      )}
    </div>
  )
}
