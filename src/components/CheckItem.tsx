import type { Check } from '@/lib/types'

const statusConfig = {
  good: { label: 'GOOD', bg: 'bg-green-500/20', border: 'border-green-500/30', pill: 'bg-green-500', dot: 'bg-green-400' },
  needs_work: { label: 'NEEDS WORK', bg: 'bg-orange-500/10', border: 'border-orange-500/20', pill: 'bg-orange-500', dot: 'bg-orange-400' },
  critical: { label: 'CRITICAL', bg: 'bg-rebel-red/10', border: 'border-rebel-red/20', pill: 'bg-rebel-red', dot: 'bg-rebel-red' },
}

export default function CheckItem({ check }: { check: Check }) {
  const cfg = statusConfig[check.status]
  return (
    <div className={`rounded-lg border ${cfg.bg} ${cfg.border} p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${cfg.dot}`} />
          <span className="text-white font-semibold text-xs uppercase tracking-wide truncate"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {check.name}
          </span>
        </div>
        <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.pill}`}>
          {cfg.label}
        </span>
      </div>
      <p className="text-white/75 text-xs mt-2 leading-relaxed pl-3.5">{check.detail}</p>
      {check.fix && (
        <div className="mt-2 ml-3.5 bg-black/40 border border-rebel-red/20 rounded px-2.5 py-2">
          <p className="text-rebel-red text-[11px] font-semibold leading-relaxed">
            FIX: {check.fix}
          </p>
        </div>
      )}
    </div>
  )
}
