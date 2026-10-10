import { publications } from '@/lib/site'

export function PublicationList() {
  return (
    <ul className="divide-y divide-border">
      {publications.map((publication) => (
        <li key={publication.title} className="py-4">
          <p className="font-medium leading-snug">{publication.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {publication.authors} · {publication.venue}, {publication.year}
          </p>
          {publication.links ? (
            <p className="mt-2 flex flex-wrap gap-x-3 text-sm">
              {Object.entries(publication.links).map(([kind, href]) => (
                <a key={kind} href={href} className="link"
                  target={href.startsWith('https://') ? '_blank' : undefined}
                  rel={href.startsWith('https://') ? 'noreferrer' : undefined}>
                  {{ pdf: 'PDF', paper: 'Paper', code: 'Code' }[kind as 'pdf' | 'paper' | 'code']}
                </a>
              ))}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
