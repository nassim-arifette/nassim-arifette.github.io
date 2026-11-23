import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectCards, splitFeatured } from '@/components/project-list'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: site.name,
  description: site.description,
  path: '/',
  ogImage: getOgImageUrl(),
})

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-16 scroll-mt-20">
      <h2 id={`${id}-title`} className="section-title mb-6">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function HomePage() {
  const allProjects = getAllProjects()
  // The four most important entries with a picture, ranked by each project's `priority`.
  const projects = splitFeatured(allProjects.filter((project) => project.category !== 'research')).featured
  const research = splitFeatured(allProjects.filter((project) => project.category === 'research')).featured

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: absoluteUrl('/'),
    jobTitle: site.role,
    affiliation: { '@type': 'Organization', name: site.affiliation.name, url: site.affiliation.url },
    worksFor: { '@type': 'Organization', name: site.lab.name, url: site.lab.url },
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
          <a href={site.lab.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
            {site.lab.name}
          </a>
          ,{' '}
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
        <ProjectCards projects={projects} />
        <p className="mt-8 text-sm"><Link href="/projects" className="link">All projects →</Link></p>
      </Section>

      <Section id="research" title="Selected research">
        <ProjectCards projects={research} />
        <p className="mt-8 text-sm"><Link href="/research" className="link">All research and reports →</Link></p>
      </Section>

    </div>
  )
}
