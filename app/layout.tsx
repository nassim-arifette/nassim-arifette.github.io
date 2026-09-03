import type { Metadata } from 'next'
import './globals.css'
import 'katex/dist/katex.min.css'
import { Inter } from 'next/font/google'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import { getSiteUrl } from '@/lib/seo'
import { site } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: [],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const rssUrl = `${getSiteUrl()}/feed.xml`

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fdfdfc" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1c1d22" />
        <link rel="alternate" type="application/rss+xml" href={rssUrl} title="RSS feed" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="google-site-verification" content="p3YI81qttzelRtR5pVdQ5jPsaSk2QrVTS43TRC68y58" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <a
              href="#main-content"
              className="no-print fixed left-4 top-3 z-50 -translate-y-20 rounded bg-foreground px-3 py-2 text-sm text-background transition-transform focus:translate-y-0"
            >
              Skip to content
            </a>
            <Header />
            <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 outline-none sm:py-14">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
