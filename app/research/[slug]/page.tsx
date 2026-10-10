import { getAllProjects } from '@/lib/content'
export { default, generateMetadata } from '@/app/projects/[slug]/page'

export function generateStaticParams() {
  return getAllProjects()
    .filter((project) => project.category === 'research')
    .map((project) => ({ slug: project.slug }))
}
