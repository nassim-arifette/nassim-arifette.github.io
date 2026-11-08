// Single place for the personal information shown across the site.
// Edit this file to update the bio, links, and publication list.

export const site = {
  name: 'Nassim Arifette',
  role: 'PhD student',
  lab: { name: 'BIOC, Synthetic BioSystems Laboratory', url: 'https://portail.polytechnique.edu/bioc/en' },
  tagline: 'Machine learning for RNA biology',
  affiliation: {
    name: 'École Polytechnique',
    url: 'https://www.polytechnique.edu/',
  },
  url: 'https://nassim-arifette.github.io',
  email: 'nassim.ari@gmail.com',
  github: 'https://github.com/nassim-arifette',
  twitter: 'https://x.com/NassimArifette',
  linkedin: 'https://www.linkedin.com/in/nassim-arifette',
  // Set to a Google Scholar URL to show the link on the home page.
  scholar: undefined as string | undefined,
  cvPdf: '/cv.pdf',
  description:
    'PhD student at École Polytechnique (BIOC). I model RNA–RNA interactions in the influenza A virus with machine learning, as part of the Flu-PREDICT consortium.',
  bio: [
    'I started a PhD at École Polytechnique in November 2026, in the BIOC lab (Synthetic BioSystems Laboratory), advised by Philippe Nghe. I work on RNA–RNA interactions in the influenza A virus. I build coevolution (DCA) and generative (VAE) models, add physical constraints on how RNA segments pair, and train them on high-throughput data from the Flu-PREDICT consortium. The goal is to predict which mutations break or keep those interactions, including in strains that have not circulated yet.',
    'Before that I did the MVA master at ENS Paris-Saclay and four research internships: 3D CT-to-MRI translation (BioMaps, CEA / Université Paris-Saclay), neural network verification (LIX, École Polytechnique), knowledge graphs (LISN), and constrained learning for phylogenetics (CIRB, Collège de France).',
    'I also write a fair amount of software. JevGrep, a code search tool for coding agents, has 110 stars on GitHub. PC Agent explains why a Windows PC is slow and backs every number with a measurement. Last summer I built most of the MVP of a fintech platform, backend and frontend.',
  ],
  highlights: [
    { value: 'PhD', label: 'École Polytechnique, since Nov. 2026' },
    { value: '110', label: 'GitHub stars on JevGrep' },
    { value: '1st', label: 'Devin track, Paris AI Gaming Hackathon' },
    { value: '€100k', label: 'prototype funding for PREDI-Care' },
  ],
  interests: [
    'RNA–RNA interactions',
    'Influenza virus',
    'Generative models',
    'Computational biology',
    'Medical imaging',
    'Reliable machine learning',
  ],
}

export type Publication = {
  title: string
  authors: string
  venue: string
  year: number
  links?: { pdf?: string; paper?: string; code?: string }
}

// Peer-reviewed papers go first; theses and technical reports follow.
export const publications: Publication[] = [
  {
    title: 'Tropical Precision',
    authors: 'N. Arifette',
    venue: 'Research manuscript (not peer-reviewed)',
    year: 2026,
    links: {
      pdf: 'https://github.com/nassim-arifette/tropical-precision/blob/main/paper/main.pdf',
      code: 'https://github.com/nassim-arifette/tropical-precision',
    },
  },
  {
    title: 'Unpaired 3D CT-to-MRI Synthesis with Histogram-Aware CycleGANs',
    authors: 'N. Arifette',
    venue: 'Research internship report, BioMaps (CEA / Université Paris-Saclay)',
    year: 2025,
    links: { pdf: '/ct-to-mri-synthesis-report.pdf' },
  },
  {
    title: 'Knowledge Graph Entity Alignment',
    authors: 'N. Arifette',
    venue: 'Master’s internship report, LISN, Université Paris-Saclay',
    year: 2024,
  },
  {
    title: 'Neural Network Verification via Set Analysis',
    authors: 'N. Arifette',
    venue: 'M1 research report, LIX, École Polytechnique',
    year: 2024,
    links: { pdf: '/neural-network-verification-report.pdf' },
  },
  {
    title: 'Projection convexe pour garantir l’inégalité triangulaire dans Phyloformer',
    authors: 'N. Arifette',
    venue: 'Bachelor’s research report, CIRB, Collège de France',
    year: 2023,
    links: { pdf: '/phyloformer-metric-projection-report.pdf' },
  },
  {
    title: 'Voiced/Unvoiced Classification in Speech with Small CNNs',
    authors: 'N. Arifette',
    venue: 'TER report, Université Paris-Saclay',
    year: 2023,
    links: { pdf: '/voiced-unvoiced-classification-report.pdf' },
  },
]

// Homepage highlights, ordered by significance rather than publication date.
export const selectedWork = {
  projects: ['jevgrep', 'pc-agent', 'ragots', 'predi-care'],
  research: ['ct2mri', 'lidar-llm-spatial-reasoning', 'diffdock-geometric-diffusion-docking', 'm1-ter-verification'],
} as const
