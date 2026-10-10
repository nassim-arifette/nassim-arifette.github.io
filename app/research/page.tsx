import type { Metadata } from 'next'
import { ProjectList } from '@/components/project-list'
import { PublicationList } from '@/components/publication-list'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'

export const metadata: Metadata = buildMetadata({
  title: 'Research / Papers',
  description: 'Research in medical imaging, reliable machine learning, knowledge graphs, and computational biology, with manuscripts and internship reports.',
  path: '/research',
  ogImage: getOgImageUrl(),
})

export default function ResearchPage() {
  const research = getAllProjects().filter((project) => project.category === 'research')

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Research / Papers</h1>
      <p className="mt-2 text-muted-foreground">
        Research work, methods, and results, followed by the available manuscripts and reports.
      </p>
      <section aria-labelledby="research-work-title" className="mt-8">
        <h2 id="research-work-title" className="section-title">Research work</h2>
        <ProjectList projects={research} />
      </section>
      <section aria-labelledby="papers-title" className="mt-12">
        <h2 id="papers-title" className="section-title">Papers & reports</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The documents below are research reports and a manuscript, rather than peer-reviewed publications.
        </p>
        <PublicationList />
      </section>
    </div>
  )
}
