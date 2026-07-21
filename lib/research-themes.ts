export type ResearchTheme = {
  id: string
  number: string
  title: string
  diagramTitle: string
  question: string
  note: string
  links: Array<{ href: string; label: string }>
}

export const researchThemes: ResearchTheme[] = [
  {
    id: 'medical-imaging',
    number: '01',
    title: 'Medical image translation',
    diagramTitle: 'Medical image\ntranslation',
    question:
      'Can an unpaired 3D model change imaging modality while preserving anatomy and voxel geometry?',
    note: 'Fully volumetric CT-to-UTE-MRI translation, controlled CycleGAN comparisons, and structure-aware losses.',
    links: [{ href: '/projects/ct2mri', label: 'Read the CT to MRI project' }],
  },
  {
    id: 'reliable-ml',
    number: '02',
    title: 'Reliability by construction',
    diagramTitle: 'Reliability by\nconstruction',
    question: 'How can geometric and safety constraints be carried through learned models?',
    note: 'Set-based ReLU verification and metric projection for constraint-aware phylogenetic models.',
    links: [
      { href: '/projects/m1-ter-verification', label: 'Read the verification project' },
      {
        href: '/projects/l3-internship-phyloformer',
        label: 'Read the Phyloformer project',
      },
    ],
  },
  {
    id: 'structured-data',
    number: '03',
    title: 'Representations for structured data',
    diagramTitle: 'Representations for\nstructured data',
    question:
      'Which representations retain the structure a task needs when data or model capacity is limited?',
    note: 'Comparative work on speech features and knowledge-graph embedding families under controlled evaluation.',
    links: [
      { href: '/projects/l3-ter-voice', label: 'Read the speech project' },
      {
        href: '/projects/m1-internship-kg',
        label: 'Read the knowledge graph project',
      },
    ],
  },
  {
    id: 'grounded-agents',
    number: '04',
    title: 'Grounded AI systems',
    diagramTitle: 'Grounded AI\nsystems',
    question:
      'How can retrieval and tool use turn open requests into useful plans tied to data and context?',
    note: 'A multilingual RAG and tool-using concierge that turns visitor questions into navigable plans.',
    links: [
      {
        href: '/projects/vers-AI-lles',
        label: 'Read the Versailles Concierge project',
      },
    ],
  },
]
