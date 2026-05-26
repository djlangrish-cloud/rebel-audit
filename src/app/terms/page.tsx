import Link from 'next/link'

export const metadata = {
  title: 'Terms of Use — Rebel SEO Audit',
}

export default function Terms() {
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
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-8 w-fit transition-colors">
          ← Back
        </Link>

        <p className="text-rebel-red text-xs font-semibold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="text-white font-bold text-3xl uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Terms of Use
        </h1>
        <p className="text-white/50 text-sm mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-white/75 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              About this tool
            </h2>
            <p>
              The Rebel SEO Audit is a free diagnostic tool provided by Dan Langrish trading as Rebel Marketer. It analyses publicly accessible web pages against a set of on-page SEO criteria and returns a scored report. By using this tool you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Acceptable use
            </h2>
            <p className="mb-3">You may use this tool to audit websites you own or have permission to analyse. You must not:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use the tool to audit websites without authorisation from the site owner</li>
              <li>Attempt to overload, exploit, or reverse-engineer the service</li>
              <li>Use automated scripts to submit large numbers of audits</li>
              <li>Use results to misrepresent or defame any business</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Accuracy and limitations
            </h2>
            <p className="mb-3">
              Audit results are indicative only. The tool performs automated analysis of HTML source code and cannot replicate the full behaviour of search engine crawlers. Scores should be treated as a starting point for investigation, not a definitive measure of search performance.
            </p>
            <p>
              Results may vary depending on page rendering, caching, or changes made to the target page after auditing. We make no guarantee that improving your score will result in specific rankings or traffic.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Intellectual property
            </h2>
            <p>
              The scoring methodology, report format, and all content produced by this tool are the intellectual property of Rebel Marketer. You may download and share your own audit results, but you may not reproduce or resell the tool or its methodology without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No warranty
            </h2>
            <p>
              This tool is provided &quot;as is&quot; without warranty of any kind, express or implied. Rebel Marketer accepts no liability for decisions made based on audit results, for any interruption of service, or for any direct or indirect loss arising from use of this tool.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Quote requests
            </h2>
            <p>
              Submitting a quote request does not create a contract or obligation on either party. It is an expression of interest only. Any subsequent engagement will be governed by a separate written agreement.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Governing law
            </h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Contact
            </h2>
            <p>
              Questions about these terms: <a href="mailto:dan@rebelmarketer.co.uk" className="text-rebel-red hover:underline">dan@rebelmarketer.co.uk</a>
            </p>
          </section>

        </div>
      </div>

      <footer className="border-t border-white/10 mt-16 px-6 py-8">
        <div className="max-w-2xl mx-auto flex flex-wrap gap-4 text-white/40 text-xs">
          <span>Rebel Marketer &copy; {new Date().getFullYear()}</span>
          <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">Terms of Use</Link>
        </div>
      </footer>
    </main>
  )
}
