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
        <p className="section-title">{site.tagline}</p>
        <h1 id="intro-title" className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {site.role} ·{' '}
          <a href={site.lab.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
            {site.lab.name}
          </a>
          ,{' '}
          <a href={site.affiliation.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
            {site.affiliation.name}
          </a>
        </p>

        <div className="mt-8 rounded-xl border bg-muted/50 p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Currently
          </p>
          <p className="mt-2 leading-relaxed">{site.bio[0]}</p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {site.highlights.map((item) => (
            <div key={item.label} className="rounded-xl border p-4">
              <dt className="sr-only">{item.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight text-accent">{item.value}</dd>
              <dd className="mt-1 text-xs leading-snug text-muted-foreground">{item.label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 space-y-4 leading-relaxed">
          {site.bio.slice(1).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <p className="mt-8 flex flex-wrap gap-2 text-sm">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              className={
                link.label === 'CV'
                  ? 'rounded-full bg-accent px-4 py-1.5 font-medium text-background transition-opacity hover:opacity-90'
                  : 'rounded-full border px-4 py-1.5 transition-colors hover:border-accent hover:text-accent'
              }
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
