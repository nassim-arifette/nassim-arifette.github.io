// Single place for the personal information shown across the site.
// Edit this file to update the bio, links, and publication list.

export const site = {
  name: 'Nassim Arifette',
  role: 'PhD student (from October 2026)',
  affiliation: {
    name: 'École Polytechnique',
    url: 'https://www.polytechnique.edu/',
  },
  url: 'https://nassim-arifette.github.io',
  email: 'nassim.ari@gmail.com',
  github: 'https://github.com/nassim-arifette',
  linkedin: 'https://www.linkedin.com/in/nassim-arifette',
  // Set to a Google Scholar URL to show the link on the home page.
  scholar: undefined as string | undefined,
  cvPdf: '/cv.pdf',
  description:
    'PhD student at École Polytechnique working on RNA–RNA interactions, in particular in the influenza A virus, with machine-learning and computational methods.',
  bio: [
    'I am starting a PhD at École Polytechnique in October 2026. My thesis studies RNA–RNA interactions, in particular in the influenza A virus, using machine-learning and computational methods.',
    'Before that, I completed the MVA master’s programme at ENS Paris-Saclay and did research internships in 3D medical imaging (BioMaps, CEA / Université Paris-Saclay), neural-network verification (LIX, École Polytechnique), knowledge graphs (LISN), and computational phylogenetics (CIRB, Collège de France).',
  ],
  interests: [
    'RNA–RNA interactions',
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
    title: 'Unpaired 3D CT-to-MRI Synthesis with Histogram-Aware CycleGANs',
    authors: 'N. Arifette',
    venue: 'Research internship report, BioMaps (CEA / Université Paris-Saclay)',
    year: 2025,
    links: { pdf: '/ct-to-mri-synthesis-report.pdf' },
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
