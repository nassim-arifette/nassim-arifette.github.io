import type { Project } from 'contentlayer/generated'

export function ProjectPreview({ project, compact = false }: { project: Project; compact?: boolean }) {
  const preview = project.preview
  if (!preview) return null

  return (
    <figure className="my-5">
      {preview.type === 'video' ? (
        <video controls playsInline preload="metadata" aria-label={preview.alt}
          className="aspect-video w-full rounded-md border border-border bg-black object-contain" src={preview.src}>
          <a href={preview.src}>Watch the {project.title} demonstration</a>
        </video>
      ) : (
        // Original project screenshots and animated demos keep their native proportions.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview.src} alt={preview.alt} width={preview.width} height={preview.height}
          loading="lazy" decoding="async"
          className={`${compact ? 'max-h-72' : 'max-h-[28rem]'} ${preview.width && preview.height && preview.width < preview.height ? 'mx-auto w-auto' : 'w-full'} rounded-md border border-border object-contain`} />
      )}
      <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">{preview.caption}</figcaption>
    </figure>
  )
}
