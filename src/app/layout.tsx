import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Rebel SEO Audit',
    template: '%s — Rebel SEO Audit',
  },
  description: 'Free on-page SEO audit. Find out what search engines actually see on your website.',
  icons: {
    icon: 'https://rebelmarketer.co.uk/wp-content/uploads/2025/09/R.png',
    apple: 'https://rebelmarketer.co.uk/wp-content/uploads/2025/09/R.png',
  },
  verification: {
    google: 'jEHJN_ohekqscWRrtV9P_cGOmHZg4q5zy7lSgkTdut4',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-rebel-black text-rebel-white font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
