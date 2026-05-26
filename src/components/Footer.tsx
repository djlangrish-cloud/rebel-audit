import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16 px-6 py-8">
      <div className="max-w-4xl mx-auto flex flex-wrap gap-4 text-white/40 text-xs">
        <span>Rebel Marketer &copy; {new Date().getFullYear()}</span>
        <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-white/70 transition-colors">Terms of Use</Link>
      </div>
    </footer>
  )
}
