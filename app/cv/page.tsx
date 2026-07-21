import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { FileDown } from 'lucide-react'
import { CvPdfPreviewButton } from '@/components/cv-pdf-preview-button'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'

export const metadata: Metadata = buildMetadata({
  title: 'CV',
  description: 'Read Nassim Arifette’s background in machine-learning research and engineering, computer vision, 3D, and medical imaging.',
  path: '/cv',
  ogImage: getOgImageUrl(),
  type: 'profile',
})

function CvSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="grid gap-5 border-b border-border py-9 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-10">
      <h2 id={id} className="manuscript-label pt-1 text-signal">
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export default function CvPage() {
  const pdfUrl = '/cv.pdf'
  const name = 'Nassim Arifette'
  const role = 'Machine-learning research & engineering · Computer vision · 3D · Medical imaging'
  const emailAddress = 'nassim.ari@gmail.com'
  const emailLabel = 'nassim dot ari at gmail dot com'
  const linkedIn = 'https://www.linkedin.com/in/nassim-arifette'
  const github = 'https://github.com/nassim-arifette'
  const website = 'https://nassim-arifette.github.io'
  const hasPdf = fs.existsSync(path.join(process.cwd(), 'public', 'cv.pdf'))

  return (
    <article className="mx-auto max-w-5xl">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name,
            url: website,
            sameAs: [linkedIn, github, website],
            email: `mailto:${emailAddress}`,
            description: 'Machine-learning research and engineering across computer vision, 3D, and medical imaging.',
          }),
        }}
      />

      {/* Header / identity */}
      <header className="border-b border-border pb-10 pt-3 sm:pb-12 lg:pt-8 print:gap-1">
        <p className="manuscript-label text-signal">About · Curriculum vitae</p>
        <h1 className="mt-5 text-[clamp(3.5rem,8vw,7rem)] font-medium leading-[0.9] tracking-[-0.05em]">{name}</h1>
        <p className="mt-5 font-serif text-xl text-muted-foreground sm:text-2xl">{role}</p>

        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <a href={`mailto:${emailAddress}`} className="underline underline-offset-4">{emailLabel}</a>
          <span aria-hidden className="text-muted-foreground">•</span>
          <a href={linkedIn} target="_blank" rel="noreferrer" className="underline underline-offset-4">LinkedIn</a>
          <span aria-hidden className="text-muted-foreground">•</span>
          <a href={github} target="_blank" rel="noreferrer" className="underline underline-offset-4">GitHub</a>
          <span aria-hidden className="text-muted-foreground">•</span>
          <a href={website} target="_blank" rel="noreferrer" className="underline underline-offset-4">Website</a>
          <span aria-hidden className="text-muted-foreground">•</span>
        </div>

        {/* Actions (hidden in print) */}
        <div className="no-print mt-7 flex flex-wrap gap-2">
          {hasPdf ? (
            <a
              href="/cv.pdf"
              download="Nassim-Arifette-CV.pdf"
              className="inline-flex min-h-11 items-center gap-2 bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-signal"
            >
              <FileDown size={16} aria-hidden="true" /> Download CV (PDF)
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">
              Place your CV at <code className="font-mono">public/cv.pdf</code> to enable download and preview.
            </span>
          )}
          {hasPdf && <CvPdfPreviewButton targetId="pdf-viewer" />}
        </div>
      </header>

      {/* Profile */}
      <CvSection id="profile" title="01 · Profile">
        <p className="max-w-[72ch] text-base leading-7 text-muted-foreground">
          My background includes MVA coursework at ENS Paris-Saclay (17/20) and research internships at CEA,
          Collège de France, and Université Paris-Saclay. I build reproducible deep-learning systems for 3D vision,
          medical imaging, reliable ML, and structured data, with careful evaluation of both results and limitations.
        </p>
      </CvSection>

      {/* Experience */}
      <CvSection id="experience" title="02 · Experience">
        <div className="border-b border-border pb-5">
          <h3 className="text-xl font-medium">
            BioMaps, CEA & Université Paris-Saclay • Research Intern
            <span className="text-muted-foreground font-normal"> (2025)</span>
          </h3>
          <ul className="list-disc ml-5 text-sm leading-relaxed text-muted-foreground">
            <li>Built a reproducible 3D CT↔UTE-MRI pipeline; trained 3D CycleGAN variants on 311 CT and 292 UTE-MRI training cases.</li>
            <li>Added a histogram-aware loss → CT→MRI FID 225.96→217.89 (−3.6%), KID 0.1158→0.0969 (−16.3%).</li>
            <li>Achieved cycle fidelity of ≈23.4 dB PSNR and ≈0.68 SSIM across validation cohorts.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-medium">
            Collège de France, CIRB • Research Intern
            <span className="text-muted-foreground font-normal"> (Jun 2023 – Aug 2023)</span>
          </h3>
          <ul className="list-disc ml-5 text-sm leading-relaxed text-muted-foreground">
            <li>Enhanced Phyloformer with triangle-inequality constraints; trained on 1,000 genetic sequences (30 min on V100).</li>
            <li>Maintained RF-distance while cutting constraint violations from 15% to &lt;1% (trees with 10–100 leaves).</li>
          </ul>
        </div>
      </CvSection>

      {/* Education */}
      <CvSection id="education" title="03 · Education">
        <p className="text-sm text-muted-foreground">
          ENS Paris-Saclay — Master 2 coursework (MVA), 2024–2025 • Grade average 17/20 — Deep Learning for Medical Imaging, 3D Vision, Generative Models.
        </p>
        <p className="text-sm text-muted-foreground">
          Université Paris-Saclay — Master 1 (AI), 2023–2024 • Grade average 16/20 — NN Verification, NLP, Convex Optimization.
        </p>
        <p className="text-sm text-muted-foreground">
          Université Paris-Saclay — BSc (Math & CS, research track), 2021–2023 — Statistical Learning, Algorithms, DB Systems.
        </p>
      </CvSection>

      {/* Skills */}
      <CvSection id="skills" title="04 · Skills">
        <p className="text-sm text-muted-foreground">
          Programming: Python, C++, Julia, OCaml, SQL, Rust, Coq, JavaScript (React, Node.js)
        </p>
        <p className="text-sm text-muted-foreground">
          ML/DL: PyTorch, TensorFlow, JAX, MONAI, scikit-learn, Hugging Face
        </p>
        <p className="text-sm text-muted-foreground">
          Infra: CUDA, Docker, Git, Linux, SLURM, AWS, MLflow, Hydra/OmegaConf
        </p>
        <p className="text-sm text-muted-foreground">
          Languages: French (Native), English (C1)
        </p>
      </CvSection>

      {/* Selected Projects */}
      <CvSection id="projects" title="05 · Selected projects">
        <ul className="list-disc ml-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <Link href="/projects/ct2mri" className="underline underline-offset-4">CT → MRI Synthesis</Link>
            : Unpaired 3D image translation with a custom histogram-aware loss.
          </li>
          <li>
            Neural Network Verification via Set Analysis — Explored zones (DBMs) and tropical-geometry prototypes for tighter ReLU-network bounds, evaluated on ACAS Xu.
          </li>
          <li>
            Deep Learning for Voiced/Unvoiced Speech — CNN on MFCCs (85.2% validation accuracy) with 7-fold cross-validation; investigated augmentation for overfitting.
          </li>
          <li>
            YOLOv1 Reimplementation — Trained on Pascal VOC and benchmarked five YOLO variants, with exported weights and demos.
          </li>
        </ul>
      </CvSection>

      {/* Embedded PDF viewer */}
      {hasPdf && (
        <section aria-labelledby="pdf-title" className="no-print grid scroll-mt-24 gap-5 border-b border-border py-9 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-10">
          <h2 id="pdf-title" className="manuscript-label pt-1 text-signal">06 · Original document</h2>
          <details id="pdf-viewer" className="group border-y border-border py-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold">
              Preview CV in the browser
              <span className="font-serif text-xl text-muted-foreground group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <object data={pdfUrl} type="application/pdf" aria-label="Embedded preview of Nassim Arifette's CV" className="mt-3 hidden h-[70vh] min-h-[34rem] w-full border border-border md:block">
              <p className="p-4 text-sm text-muted-foreground">
                Your browser can’t display the PDF inline.
                <a href={pdfUrl} className="ml-1 underline underline-offset-4">Open or download the CV (PDF)</a>.
              </p>
            </object>
            <p className="mt-3 text-sm text-muted-foreground md:hidden">
              The inline preview is hidden on small screens.{' '}
              <a href={pdfUrl} className="font-medium text-signal underline underline-offset-4">Open the CV PDF</a>.
            </p>
          </details>
        </section>
      )}
    </article>
  )
}
