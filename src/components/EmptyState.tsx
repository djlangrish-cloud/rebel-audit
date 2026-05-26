import AuditForm from './AuditForm'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1
        className="text-white font-bold text-4xl uppercase leading-tight"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Get a full SEO audit in seconds
      </h1>
      <p className="text-white/70 text-base mt-3 max-w-md leading-relaxed">
        Scored on Technical, On-Page, Content, and Authority signals.
        Free. No account needed.
      </p>
      <div className="w-full max-w-xl mt-8">
        <AuditForm hero />
      </div>
    </div>
  )
}
