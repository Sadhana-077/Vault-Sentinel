import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

export const metadata: Metadata = {
  title: 'VaultSentinel - Crypto Exchange Solvency Monitor',
  description: 'Real-time solvency monitoring for top crypto exchanges powered by Chainlink CRE oracles. Track reserve-to-liability ratios, receive alerts, and verify exchange health.',
  icons: {
    icon: [
      {
        url: '/logo.png?v=2',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo.png?v=2',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo.png?v=2',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.png?v=2',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d1117',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
