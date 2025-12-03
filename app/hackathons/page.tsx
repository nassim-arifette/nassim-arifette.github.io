import type { Metadata } from 'next'
import { allProjects } from 'contentlayer/generated'
import { absoluteUrl } from '@/lib/seo'
import { HackathonsClient } from './hackathons-client'

export const metadata: Metadata = {
  title: 'Hackathons – Nassim Arifette',
  description: 'Hackathons I have participated in and the projects built during each event.',
  alternates: {
    canonical: absoluteUrl('/hackathons'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/hackathons'),
    title: 'Hackathons – Nassim Arifette',
    description: 'Projects built during hackathons I have joined.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hackathons – Nassim Arifette',
    description: 'Projects built during hackathons I have joined.',
  },
}

export default function HackathonsPage() {
  const hackathonProjects = [...allProjects]
    .filter((project) => project.tags?.some((tag) => tag.toLowerCase() === 'hackathon'))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return <HackathonsClient projects={hackathonProjects} />
}
