import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectList } from '@/components/project-list'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'
import { selectedWork, site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: site.name,
  description: site.description,
  path: '/',
  ogImage: getOgImageUrl(),
})

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-14 scroll-mt-20">
      <h2 id={`${id}-title`} className="section-title mb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function HomePage() {
  const allProjects = getAllProjects()
  // Keep the editorial order instead of selecting the newest entries.
  const select = (slugs: readonly string[]) =>
    slugs.flatMap((slug) => allProjects.filter((project) => project.slug === slug))
  const projects = select(selectedWork.projects)
  const research = select(selectedWork.research)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: absoluteUrl('/'),
    jobTitle: site.role,
    affiliation: { '@type': 'Organization', name: site.affiliation.name, url: site.affiliation.url },
    sameAs: [site.linkedin, site.github, site.twitter],
    description: site.description,
    knowsAbout: site.interests,
  }

  const contactLinks = [
    { label: 'Email', href: `mailto:${site.email}`, external: false },
    { label: 'GitHub', href: site.github, external: true },
    { label: 'LinkedIn', href: site.linkedin, external: true },
    { label: 'X / Twitter', href: site.twitter, external: true },
    ...(site.scholar ? [{ label: 'Google Scholar', href: site.scholar, external: true }] : []),
    { label: 'CV', href: site.cvPdf, external: false },
  ]

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section aria-labelledby="intro-title">
        <h1 id="intro-title" className="text-3xl font-semibold tracking-tight">
          {site.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {site.role} ·{' '}
          <a href={site.affiliation.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
            {site.affiliation.name}
          </a>
        </p>

        <div className="mt-6 space-y-4 leading-relaxed">
          {site.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              className="link"
            >
              {link.label}
            </a>
          ))}
        </p>
      </section>

      <Section id="projects" title="Selected projects">
        <ProjectList projects={projects} />
        <p className="mt-4 text-sm"><Link href="/projects" className="link">All projects →</Link></p>
      </Section>

      <Section id="research" title="Selected research & reports">
        <ProjectList projects={research} />
        <p className="mt-4 text-sm"><Link href="/research" className="link">Research work, papers & reports →</Link></p>
      </Section>

      <Section id="contact" title="Contact">
        <p className="leading-relaxed">
          The best way to reach me is by email at{' '}
          <a href={`mailto:${site.email}`} className="link">
            {site.email}
          </a>
          .
        </p>
      </Section>
    </div>
  )
}
