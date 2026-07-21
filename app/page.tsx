import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  FileDown,
  Github,
  Linkedin,
  Mail,
} from 'lucide-react'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { PostCard } from '@/components/cards/PostCard'
import { ResearchMap } from '@/components/research-map'
import { researchThemes } from '@/lib/research-themes'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects, getPublishedPosts } from '@/lib/content'

export const metadata: Metadata = buildMetadata({
  title: 'Machine Learning Research & Engineering',
  description:
    'Nassim Arifette works across 3D medical imaging, computer vision, neural-network verification, structured learning, and grounded AI systems.',
  path: '/',
  ogImage: getOgImageUrl(),
})

const selectedProjectSlugs = [
  'ct2mri',
  'm1-ter-verification',
  'm1-internship-kg',
  'vers-AI-lles',
]

export default function HomePage() {
  const posts = getPublishedPosts().slice(0, 3)
  const projectItems = getAllProjects()
  const projects = selectedProjectSlugs
    .map((slug) => projectItems.find((project) => project.slug === slug))
    .filter((project): project is NonNullable<typeof project> => Boolean(project))
  const reportCount = projectItems.filter((project) => Boolean(project.links?.pdf)).length

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nassim Arifette',
    url: absoluteUrl('/'),
    headline: 'Machine-learning researcher and engineer',
    jobTitle: 'Machine Learning Engineer and Researcher',
    sameAs: [
      'https://www.linkedin.com/in/nassim-arifette',
      'https://github.com/nassim-arifette',
      'https://nassim-arifette.github.io',
    ],
    description:
      'Machine-learning research and engineering across computer vision, medical imaging, reliable ML, and structured data.',
    knowsAbout: [
      'computer vision',
      'medical imaging',
      'neural network verification',
      'knowledge graphs',
      'deep learning',
    ],
    alumniOf: ['École Normale Supérieure Paris-Saclay', 'Université Paris-Saclay'],
  }

  return (
    <div className="pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section
        id="research"
        aria-labelledby="home-title"
        className="scroll-mt-28 border-b border-border pb-16 pt-3 sm:pb-20 lg:pt-8"
      >
        <div className="grid gap-12 lg:grid-cols-[3rem_minmax(0,0.93fr)_minmax(30rem,1.07fr)] lg:gap-10 xl:gap-14">
          <div className="hidden border-r border-border pr-3 lg:flex lg:flex-col lg:items-center">
            <span className="font-serif text-lg text-signal">01</span>
            <span className="mt-4 [writing-mode:vertical-rl] text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Opening argument
            </span>
            <span className="mt-auto h-16 w-px bg-border" aria-hidden="true" />
          </div>

          <div className="flex flex-col justify-center">
            <p className="manuscript-label text-signal">
              Machine learning research · Computer vision · Reliable systems
            </p>
            <h1
              id="home-title"
              className="mt-7 max-w-[15ch] text-[clamp(3rem,6.2vw,5.8rem)] font-medium leading-[0.98] tracking-[-0.045em]"
            >
              Building systems that <em className="font-normal text-signal">preserve structure</em>{' '}
              on difficult data.
            </h1>
            <p className="mt-8 max-w-[64ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              I&apos;m Nassim Arifette. My work spans 3D medical imaging, computer vision,
              neural-network verification, and structured learning. I build reproducible
              systems and evaluate them carefully, from anatomy-preserving CT-to-MRI
              translation to constraint-aware models and grounded AI assistants.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/projects"
                className="group inline-flex min-h-11 items-center gap-2 bg-signal px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground"
              >
                Explore projects
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link href="/blog" className="editorial-link">
                Read research notes <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <a
                href="/cv.pdf"
                download="Nassim-Arifette-CV.pdf"
                className="editorial-link text-foreground"
              >
                Download CV <FileDown size={15} aria-hidden="true" />
              </a>
            </div>

            <nav className="mt-8 flex items-center gap-1" aria-label="Professional profiles">
              <a
                href="https://github.com/nassim-arifette"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub profile (opens in a new tab)"
                className="inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-signal"
              >
                <Github size={18} aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/in/nassim-arifette"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn profile (opens in a new tab)"
                className="inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-signal"
              >
                <Linkedin size={18} aria-hidden="true" />
              </a>
              <a
                href="mailto:nassim.ari@gmail.com"
                aria-label="Email Nassim Arifette"
                className="inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-signal"
              >
                <Mail size={18} aria-hidden="true" />
              </a>
            </nav>
          </div>

          <div className="self-center">
            <ResearchMap />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="threads-title"
        className="grid border-b border-border py-16 lg:grid-cols-[3rem_minmax(0,1fr)] lg:gap-10 sm:py-20"
      >
        <div className="hidden border-r border-border pr-3 lg:block">
          <span className="block text-center font-serif text-lg text-muted-foreground">02</span>
        </div>
        <div>
          <div className="grid gap-6 border-b border-border pb-8 md:grid-cols-[minmax(0,1fr)_minmax(17rem,0.44fr)] md:items-end">
            <div>
              <p className="manuscript-label text-signal">Research threads</p>
              <h2 id="threads-title" className="mt-3 text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.035em]">
                Questions, methods, evidence.
              </h2>
            </div>
            <p className="max-w-[48ch] text-sm leading-6 text-muted-foreground md:justify-self-end">
              These are recurring themes across the work already documented here. Each one
              connects a concrete question to a project, report, or experiment.
            </p>
          </div>

          <ol className="grid border-b border-border md:grid-cols-2 xl:grid-cols-4">
            {researchThemes.map((theme, index) => (
              <li
                key={theme.id}
                className={`flex flex-col py-7 md:min-h-[21rem] md:px-7 ${
                  index % 2 === 1 ? 'md:border-l md:border-border' : ''
                } ${index > 1 ? 'border-t border-border xl:border-t-0' : ''} ${
                  index > 0 ? 'xl:border-l xl:border-border' : ''
                }`}
              >
                <p className="manuscript-label text-signal">{theme.number}</p>
                <h3 className="mt-5 text-2xl font-medium leading-tight">{theme.title}</h3>
                <p className="mt-4 text-sm leading-6 text-foreground">{theme.question}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{theme.note}</p>
                <div className="mt-auto flex flex-col items-start gap-1 pt-6">
                  {theme.links.map((link) => (
                    <Link key={link.href} href={link.href} className="editorial-link text-xs">
                      {link.label} <ArrowUpRight size={13} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="selected-work"
        aria-labelledby="selected-work-title"
        className="grid border-b border-border py-16 lg:grid-cols-[3rem_minmax(0,1fr)] lg:gap-10 sm:py-20"
      >
        <div className="hidden border-r border-border pr-3 lg:block">
          <span className="block text-center font-serif text-lg text-muted-foreground">03</span>
        </div>
        <div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)] lg:items-end">
            <div>
              <p className="manuscript-label text-signal">Selected results and artifacts</p>
              <h2 id="selected-work-title" className="mt-3 max-w-[15ch] text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.035em]">
                Work explained through the evidence.
              </h2>
            </div>
            <aside className="marginalia lg:justify-self-end">
              <p className="manuscript-label">Archive note</p>
              <p className="mt-2 max-w-[38ch]">
                {projectItems.length} project records, {reportCount} full technical reports,
                and {getPublishedPosts().length} published notes are available in this site.
              </p>
              <Link href="/projects" className="mt-3 inline-flex items-center gap-1 text-signal">
                Open the project index <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </aside>
          </div>

          <div className="mt-12 grid border-y border-border lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="divide-y divide-border lg:border-r lg:border-border">
              {projects.map((project, index) => (
                <ProjectCard key={project.slug} project={project} idAnchor index={index + 1} />
              ))}
            </div>
            <div className="grid content-start gap-10 p-5 sm:p-7">
              <figure>
                <figcaption className="manuscript-label">Result note · CT→MRI</figcaption>
                <p className="mt-3 font-serif text-xl leading-snug">
                  Histogram-aware training improved distributional similarity while retaining
                  anatomical fidelity.
                </p>
                <dl className="mt-5 grid grid-cols-2 border-y border-border text-sm">
                  <div className="border-r border-border py-4 pr-3">
                    <dt className="manuscript-label">FID ↓</dt>
                    <dd className="mt-2 font-serif text-2xl tabular-nums">
                      225.96 <span className="text-signal">→ 217.89</span>
                    </dd>
                  </div>
                  <div className="py-4 pl-3">
                    <dt className="manuscript-label">KID ↓</dt>
                    <dd className="mt-2 font-serif text-2xl tabular-nums">
                      .1158 <span className="text-signal">→ .0969</span>
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Report values comparing the ResNet-LSGAN baseline with Hist-CycleGAN.
                </p>
              </figure>

              <figure className="border-t border-border pt-5">
                <Image
                  src="/datacraft_versailles_hackathon.png"
                  alt="Team presenting Versailles Concierge during the Datacraft and Château de Versailles hackathon"
                  width={267}
                  height={400}
                  sizes="(max-width: 1024px) 100vw, 288px"
                  className="aspect-[4/3] w-full object-cover object-center grayscale transition duration-300 hover:grayscale-0"
                />
                <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
                  <span className="font-semibold text-foreground">Figure 2.</span> Presenting the
                  multilingual Versailles Concierge prototype, built with RAG, agents, and live
                  tools.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="notes-title"
        className="grid border-b border-border py-16 lg:grid-cols-[3rem_minmax(0,1fr)] lg:gap-10 sm:py-20"
      >
        <div className="hidden border-r border-border pr-3 lg:block">
          <span className="block text-center font-serif text-lg text-muted-foreground">04</span>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(15rem,0.42fr)_minmax(0,1fr)]">
          <div>
            <p className="manuscript-label text-signal">Research notebook</p>
            <h2 id="notes-title" className="mt-3 text-[clamp(2.4rem,4vw,4rem)] font-medium leading-none tracking-[-0.035em]">
              Notes that show the reasoning.
            </h2>
            <p className="mt-5 max-w-[42ch] text-sm leading-6 text-muted-foreground">
              Longer explanations, mathematical readings, implementation notes, and working
              ideas. The aim is to make the path to a result visible, not only the result.
            </p>
            <Link href="/blog" className="editorial-link mt-6">
              Browse all notes <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="border-y border-border [&>article:first-child]:border-t-0">
            {posts.length ? (
              posts.map((post) => <PostCard key={post.slug} post={post} />)
            ) : (
              <p className="py-7 text-sm text-muted-foreground">New research notes are in progress.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-7 py-14 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:py-20">
        <div>
          <p className="manuscript-label text-signal">Contact</p>
          <h2 className="mt-3 max-w-[17ch] text-[clamp(2.3rem,5vw,4.4rem)] font-medium leading-[1.03] tracking-[-0.035em]">
            Interested in reliable ML for difficult, real-world data?
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 sm:justify-end">
          <a
            href="mailto:nassim.ari@gmail.com"
            className="group inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-signal"
          >
            Start a conversation <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <Link href="/cv" className="editorial-link px-1 text-foreground">
            Read experience and education
          </Link>
        </div>
      </section>
    </div>
  )
}
