import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { FileDown, Eye } from 'lucide-react'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'

export const metadata: Metadata = buildMetadata({
  title: 'CV',
  description: 'Download or read the CV of Nassim Arifette, ML Engineer specialized in computer vision, 3D, and medical imaging.',
  path: '/cv',
  ogImage: getOgImageUrl(),
  type: 'profile',
})

export default function CvPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const pdfUrl = `${basePath}/cv.pdf`
  const name = 'Nassim Arifette'
  const role = 'ML Engineer — Computer Vision • 3D • Medical Imaging'
  const cityCountry = 'Lisses, France'
  const email = 'nassim dot ari at gmail dot com'
  const linkedIn = 'https://www.linkedin.com/in/nassim-arifette'
  const github = 'https://github.com/nassim-arifette'
  const website = 'https://nassim-arifette.github.io'
  const hasPdf = fs.existsSync(path.join(process.cwd(), 'public', 'cv.pdf'))

  return (
    <article className="space-y-8">
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
            email: `mailto:${email}`,
            jobTitle: 'ML Engineer (Computer Vision, 3D, Medical Imaging)',
            //telephone: phone,
            address: { '@type': 'PostalAddress', addressLocality: 'Lisses', addressCountry: 'FR' },
          }),
        }}
      />

      {/* Header / identity */}
      <header className="flex flex-col gap-3 print:gap-1">
        <h1 className="text-3xl font-semibold leading-tight">{name}</h1>
        <p className="text-muted-foreground">{role} • {cityCountry}</p>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a href={`mailto:${email}`} className="underline underline-offset-4">{email}</a>
          <span aria-hidden className="text-muted-foreground">•</span>
          <a href={linkedIn} target="_blank" rel="noreferrer" className="underline underline-offset-4">LinkedIn</a>
          <span aria-hidden className="text-muted-foreground">•</span>
          <a href={github} target="_blank" rel="noreferrer" className="underline underline-offset-4">GitHub</a>
          <span aria-hidden className="text-muted-foreground">•</span>
          <a href={website} target="_blank" rel="noreferrer" className="underline underline-offset-4">Website</a>
          <span aria-hidden className="text-muted-foreground">•</span>
        </div>

        {/* Actions (hidden in print) */}
        <div className="no-print mt-2 flex flex-wrap gap-2">
          {hasPdf ? (
            <Link
              href="/cv.pdf"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              <FileDown size={16} /> Download CV (PDF)
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">
              Place your CV at <code className="font-mono">public/cv.pdf</code> to enable download and preview.
            </span>
          )}
          {hasPdf && (
            <a
              href="#pdf-viewer"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              <Eye size={16} /> View embedded PDF
            </a>
          )}
        </div>
      </header>

      {/* Profile */}
      <section aria-labelledby="profile">
        <h2 id="profile" className="text-xl font-semibold">Profile</h2>
        <p className="text-muted-foreground">
          MVA MSc (ENS Paris-Saclay, GPA 17/20, top 1%). I build robust deep-learning systems for 3D vision and
          medical imaging, with hands-on experience in PyTorch/JAX/CUDA and research-grade development at CEA and
          Collège de France. I care about reproducibility, scalable training, and measurable impact.
        </p>
      </section>

      {/* Experience */}
      <section aria-labelledby="experience" className="space-y-4">
        <h2 id="experience" className="text-xl font-semibold">Experience</h2>

        <div>
          <h3 className="font-medium">
            BioMaps, CEA & Université Paris-Saclay • Research Intern
            <span className="text-muted-foreground font-normal"> (Apr 2025 – Present)</span>
          </h3>
          <ul className="list-disc ml-5 text-sm leading-relaxed text-muted-foreground">
            <li>Built a reproducible 3D CT↔UTE-MRI pipeline; trained 3D CycleGAN variants on 311 CT / 292 MRI volumes.</li>
            <li>Added histogram and Rician-aware losses → CT→MRI FID 225.96→217.89 (−3.6%), KID 0.1158→0.0969 (−16.3%).</li>
            <li>Achieved cycle fidelity of ≈23.4 dB PSNR and ≈0.68 SSIM across validation cohorts.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium">
            Collège de France, CIRB • Research Intern
            <span className="text-muted-foreground font-normal"> (Jun 2023 – Aug 2023)</span>
          </h3>
          <ul className="list-disc ml-5 text-sm leading-relaxed text-muted-foreground">
            <li>Enhanced Phyloformer with triangle-inequality constraints; trained on 1,000 genetic sequences (30 min on V100).</li>
            <li>Maintained RF-distance while cutting constraint violations from 15% to &lt;1% (trees with 10–100 leaves).</li>
          </ul>
        </div>
      </section>

      {/* Education */}
      <section aria-labelledby="education" className="space-y-2">
        <h2 id="education" className="text-xl font-semibold">Education</h2>
        <p className="text-sm text-muted-foreground">
          ENS Paris-Saclay — Master 2 (MVA), 2024–2025 • GPA 17/20 (top 1%) — Deep Learning for Medical Imaging, 3D Vision, Generative Models.
        </p>
        <p className="text-sm text-muted-foreground">
          Université Paris-Saclay — Master 1 (AI), 2023–2024 • GPA 16/20 (top 1%) — NN Verification, NLP, Convex Optimization.
        </p>
        <p className="text-sm text-muted-foreground">
          Université Paris-Saclay — BSc (Math & CS, research track), 2021–2023 — Statistical Learning, Algorithms, DB Systems.
        </p>
      </section>

      {/* Skills */}
      <section aria-labelledby="skills" className="space-y-2">
        <h2 id="skills" className="text-xl font-semibold">Skills</h2>
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
      </section>

      {/* Selected Projects */}
      <section aria-labelledby="projects" className="space-y-3">
        <h2 id="projects" className="text-xl font-semibold">Selected Projects</h2>
        <ul className="list-disc ml-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <Link href="/projects/ct2mri" className="underline underline-offset-4">CT → MRI Synthesis</Link>
            : Unpaired 3D image translation with custom histogram and Rician-aware losses.
          </li>
          <li>
            Neural Network Verification via Set Analysis — Abstraction with zones (DBM) & tropical geometry; Julia library for tropical polyhedra; tighter bounds (2–3×) on ACAS Xu.
          </li>
          <li>
            Deep Learning for Voiced/Unvoiced Speech — CNN on MFCCs (85.2% val. acc.), 7-fold CV & augmentation to reduce overfitting from 11% → 6%.
          </li>
          <li>
            YOLOv1 Reimplementation — Matched paper mAP on Pascal VOC; released weights & benchmarking harness across 5 YOLO variants.
          </li>
        </ul>
      </section>

      {/* Embedded PDF viewer */}
      {hasPdf && (
        <section id="pdf-viewer" aria-labelledby="pdf-title" className="space-y-3 no-print">
          <h2 id="pdf-title" className="text-xl font-semibold">Embedded PDF</h2>
          <object data={pdfUrl} type="application/pdf" className="w-full h-[800px] rounded-md border">
            <p className="text-sm text-muted-foreground p-4">
              Your browser can’t display the PDF inline.
              <a href={pdfUrl} className="ml-1 underline underline-offset-4">Open or download the CV (PDF)</a>.
            </p>
          </object>
        </section>
      )}
    </article>
  )
}
