import type { Metadata } from 'next'
import './globals.css'
import 'katex/dist/katex.min.css'
import { Inter } from 'next/font/google'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import { getSiteUrl } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Nassim Arifette',
    template: '%s | Nassim Arifette',
  },
  description: 'ML engineer focused on computer vision, 3D, and medical imaging.',
  icons: [],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const rssUrl = `${getSiteUrl()}/feed.xml`

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" href={rssUrl} title="RSS feed" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="google-site-verification" content="p3YI81qttzelRtR5pVdQ5jPsaSk2QrVTS43TRC68y58" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="container flex-1 py-10">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
