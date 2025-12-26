import type { Metadata } from 'next'
import { HackathonsClient } from './hackathons-client'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'

export const metadata: Metadata = buildMetadata({
  title: 'Hackathons',
  description: 'Hackathons I have participated in and the projects built during each event.',
  path: '/hackathons',
  ogImage: getOgImageUrl(),
})

export default function HackathonsPage() {
  const hackathonProjects = getAllProjects().filter((project) =>
    project.tags?.some((tag) => tag.toLowerCase() === 'hackathon'),
  )

  return <HackathonsClient projects={hackathonProjects} />
}
