import type { Metadata } from 'next'
import { ProjectList } from '@/components/project-list'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'

export const metadata: Metadata = buildMetadata({
  title: 'Research',
  description: 'Research in medical imaging, reliable machine learning, knowledge graphs, and computational biology, with available manuscripts and reports.',
  path: '/research',
  ogImage: getOgImageUrl(),
})

export default function ResearchPage() {
  const research = getAllProjects().filter((project) => project.category === 'research')

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Research</h1>
      <p className="mt-2 text-muted-foreground">
        Research work, methods, and results. Each entry links to its available manuscript, report, or code.
      </p>
      <div className="mt-8">
        <ProjectList projects={research} />
      </div>
    </div>
  )
}
