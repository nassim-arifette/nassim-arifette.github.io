import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Series',
  description: 'Series have moved into the blog.',
  alternates: {
    canonical: absoluteUrl('/blog'),
  },
  robots: {
    index: false,
  },
}

export default function SeriesRedirectPage() {
  redirect('/blog')
}
