import type { Metadata } from 'next'
import './globals.css'
import 'katex/dist/katex.min.css'
import { Instrument_Sans, Newsreader } from 'next/font/google'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import { getSiteUrl } from '@/lib/seo'
import { getCommandSearchEntries } from '@/lib/content-projections'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-sans',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  adjustFontFallback: false,
  variable: '--font-editorial',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Nassim Arifette',
    template: '%s | Nassim Arifette',
  },
  description: 'Machine-learning research and engineering across computer vision, 3D medical imaging, reliable ML, and structured data.',
  icons: [],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const rssUrl = `${getSiteUrl()}/feed.xml`
  const commandEntries = getCommandSearchEntries()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f3e9" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#171b27" />
        <link rel="alternate" type="application/rss+xml" href={rssUrl} title="RSS feed" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="google-site-verification" content="p3YI81qttzelRtR5pVdQ5jPsaSk2QrVTS43TRC68y58" />
      </head>
      <body className={`${instrumentSans.variable} ${newsreader.variable} font-sans`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <a href="#main-content" className="no-print fixed left-4 top-3 z-50 -translate-y-20 bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0">Skip to content</a>
            <Header commandEntries={commandEntries} />
            <main id="main-content" tabIndex={-1} className="container w-full flex-1 py-8 outline-none sm:py-12">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
