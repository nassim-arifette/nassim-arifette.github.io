import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectList } from '@/components/project-list'
import { PostList } from '@/components/post-list'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects, getPublishedPosts } from '@/lib/content'
import { publications, site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: site.name,
  description: site.description,
  path: '/',
  ogImage: getOgImageUrl(),
})

const RECENT_POSTS = 4

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
  const projects = getAllProjects()
  const posts = getPublishedPosts()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: absoluteUrl('/'),
    jobTitle: site.role,
    affiliation: { '@type': 'Organization', name: site.affiliation.name, url: site.affiliation.url },
    sameAs: [site.linkedin, site.github],
    description: site.description,
    knowsAbout: site.interests,
  }

  const contactLinks = [
    { label: 'Email', href: `mailto:${site.email}`, external: false },
    { label: 'GitHub', href: site.github, external: true },
    { label: 'LinkedIn', href: site.linkedin, external: true },
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

      <Section id="projects" title="Projects">
        <ProjectList projects={projects} />
      </Section>

      {publications.length ? (
        <Section id="publications" title="Publications & reports">
          <ul className="divide-y divide-border">
            {publications.map((publication) => (
              <li key={publication.title} className="py-4">
                <p className="font-medium leading-snug">{publication.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {publication.authors} · {publication.venue}, {publication.year}
                </p>
                {publication.links ? (
                  <p className="mt-1 flex gap-x-3 text-sm">
                    {publication.links.pdf ? (
                      <a href={publication.links.pdf} className="link">
                        PDF
                      </a>
                    ) : null}
                    {publication.links.paper ? (
                      <a href={publication.links.paper} target="_blank" rel="noreferrer" className="link">
                        Paper
                      </a>
                    ) : null}
                    {publication.links.code ? (
                      <a href={publication.links.code} target="_blank" rel="noreferrer" className="link">
                        Code
                      </a>
                    ) : null}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id="notes" title="Recent notes">
        <PostList posts={posts.slice(0, RECENT_POSTS)} />
        {posts.length > RECENT_POSTS ? (
          <p className="mt-4 text-sm">
            <Link href="/blog" className="link">
              All notes →
            </Link>
          </p>
        ) : null}
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
