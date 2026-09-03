import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'CV',
  description: `Education, research experience, and skills of ${site.name}.`,
  path: '/cv',
  ogImage: getOgImageUrl(),
  type: 'profile',
})

function CvSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="section-title mb-4">
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function Entry({
  title,
  org,
  period,
  children,
}: {
  title: string
  org?: string
  period: string
  children?: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-medium leading-snug">{title}</h3>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{period}</span>
      </div>
      {org ? <p className="text-sm text-muted-foreground">{org}</p> : null}
      {children ? <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div> : null}
    </div>
  )
}

export default function CvPage() {
  const hasPdf = fs.existsSync(path.join(process.cwd(), 'public', 'cv.pdf'))

  return (
    <article>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Curriculum vitae</h1>
        <p className="mt-2 text-muted-foreground">
          {site.role} · {site.affiliation.name}
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 text-sm">
          <a href={`mailto:${site.email}`} className="link">
            {site.email}
          </a>
          <a href={site.github} target="_blank" rel="noreferrer" className="link">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer" className="link">
            LinkedIn
          </a>
          {hasPdf ? (
            <a href={site.cvPdf} download="Nassim-Arifette-CV.pdf" className="link">
              Download PDF
            </a>
          ) : null}
        </p>
      </header>

      <CvSection id="research" title="Research">
        <Entry title="PhD student" org={site.affiliation.name} period="Oct 2026 –">
          Thesis on RNA–RNA interactions, in particular in the influenza A virus, using machine-learning and
          computational methods.
        </Entry>
        <Entry title="Research intern" org="BioMaps, CEA & Université Paris-Saclay" period="2025">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Built a reproducible 3D CT↔UTE-MRI pipeline and trained 3D CycleGAN variants on 311 CT and 292 MRI
              training cases.
            </li>
            <li>
              Introduced a histogram-aware loss: CT→MRI FID 225.96→217.89, KID 0.1158→0.0969, with ≈23.4 dB PSNR and
              ≈0.68 SSIM cycle fidelity.
            </li>
          </ul>
          <p className="mt-2">
            <Link href="/projects/ct2mri" className="link">
              Project page
            </Link>
          </p>
        </Entry>
        <Entry title="Research intern" org="LISN, Université Paris-Saclay" period="Jun – Jul 2024">
          Comparative study of knowledge-graph embedding models (TransE, TransH, DistMult, ComplEx, ConvE) for entity
          alignment across YAGO, Wikidata, and DBpedia.{' '}
          <Link href="/projects/m1-internship-kg" className="link">
            Project page
          </Link>
        </Entry>
        <Entry title="Research project" org="LIX, École Polytechnique" period="2024">
          Abstraction-based verification of ReLU networks with zones (DBMs) and tropical geometry, evaluated on ACAS
          Xu.{' '}
          <Link href="/projects/m1-ter-verification" className="link">
            Project page
          </Link>
        </Entry>
        <Entry title="Research intern" org="CIRB, Collège de France" period="Jun – Aug 2023">
          Added triangle-inequality constraints to Phyloformer; cut constraint violations from 15% to under 1% while
          preserving RF distance.{' '}
          <Link href="/projects/l3-internship-phyloformer" className="link">
            Project page
          </Link>
        </Entry>
      </CvSection>

      <CvSection id="education" title="Education">
        <Entry title="Master 2 — MVA (Mathematics, Vision, Learning)" org="ENS Paris-Saclay" period="2024 – 2025">
          Deep learning for medical imaging, 3D vision, generative models. Grade average 17/20.
        </Entry>
        <Entry title="Master 1 — Artificial Intelligence" org="Université Paris-Saclay" period="2023 – 2024">
          Neural-network verification, NLP, convex optimisation. Grade average 16/20.
        </Entry>
        <Entry title="BSc — Mathematics & Computer Science (research track)" org="Université Paris-Saclay" period="2021 – 2023">
          Statistical learning, algorithms, database systems.
        </Entry>
      </CvSection>

      <CvSection id="skills" title="Skills">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="font-medium">Programming</dt>
          <dd className="text-muted-foreground">Python, C++, Julia, OCaml, SQL, Rust, Coq, JavaScript</dd>
          <dt className="font-medium">ML / DL</dt>
          <dd className="text-muted-foreground">PyTorch, TensorFlow, JAX, MONAI, scikit-learn, Hugging Face</dd>
          <dt className="font-medium">Infrastructure</dt>
          <dd className="text-muted-foreground">CUDA, Docker, Git, Linux, SLURM, AWS, MLflow, Hydra</dd>
          <dt className="font-medium">Languages</dt>
          <dd className="text-muted-foreground">French (native), English (C1)</dd>
        </dl>
      </CvSection>
    </article>
  )
}
