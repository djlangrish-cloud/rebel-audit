import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Rebel SEO Audit',
}

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="text-white/50 text-sm mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-white/75 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Who we are
            </h2>
            <p>
              This tool is operated by Dan Langrish trading as Rebel Marketer, a digital marketing consultancy based in the United Kingdom. Contact: <a href="mailto:dan@rebelmarketer.co.uk" className="text-rebel-red hover:underline">dan@rebelmarketer.co.uk</a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              What data we collect and why
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-white/90 font-medium mb-1">URLs you audit</p>
                <p>When you enter a URL, it is sent to our server to perform the audit. The URL and audit results are stored temporarily in your browser&apos;s session storage only — they are not stored in any database and are deleted when you close the tab.</p>
              </div>
              <div>
                <p className="text-white/90 font-medium mb-1">Quote requests</p>
                <p>If you choose to request a quote, you provide your name (optional), email address, and phone number. This data is transmitted via Web3Forms to Dan Langrish&apos;s email inbox. It is used solely to respond to your enquiry and is not shared with any third parties beyond the email delivery service.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              What we do not collect
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>We do not use cookies or tracking pixels</li>
              <li>We do not use Google Analytics or any third-party analytics</li>
              <li>We do not create user accounts or store audit history</li>
              <li>We do not sell or share your data with third parties for marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Third-party services
            </h2>
            <p className="mb-3">This tool uses the following third-party services:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-white/90">Web3Forms</strong> — processes quote form submissions. Their privacy policy applies to data in transit: <a href="https://web3forms.com/privacy" className="text-rebel-red hover:underline" target="_blank" rel="noopener noreferrer">web3forms.com/privacy</a></li>
              <li><strong className="text-white/90">Vercel</strong> — hosts this application. Server logs may include IP addresses for operational purposes: <a href="https://vercel.com/legal/privacy-policy" className="text-rebel-red hover:underline" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your rights (UK GDPR)
            </h2>
            <p className="mb-3">As a UK resident you have the right to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Lodge a complaint with the ICO at <a href="https://ico.org.uk" className="text-rebel-red hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email <a href="mailto:dan@rebelmarketer.co.uk" className="text-rebel-red hover:underline">dan@rebelmarketer.co.uk</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Data retention
            </h2>
            <p>Contact details submitted via the quote form are retained only as long as necessary to respond to your enquiry, and no longer than 12 months unless an ongoing business relationship is established.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Changes to this policy
            </h2>
            <p>We may update this policy occasionally. The date at the top of the page will reflect the most recent revision. Continued use of the tool constitutes acceptance of any changes.</p>
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
