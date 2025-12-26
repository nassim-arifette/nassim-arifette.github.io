import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'

type BuildMetadataOptions = {
  title: string
  description: string
  path: string
  ogImage?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  noIndex?: boolean
}

const SITE_NAME = 'Nassim Arifette'

export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = absoluteUrl(path)
  const images = ogImage ? [ogImage] : undefined
  const keywords = tags?.map((tag) => tag.trim()).filter(Boolean)
  const uniqueKeywords = keywords ? Array.from(new Set(keywords)) : undefined

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    keywords: uniqueKeywords && uniqueKeywords.length > 0 ? uniqueKeywords : undefined,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      images,
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
      ...(type === 'article' && uniqueKeywords && uniqueKeywords.length > 0 ? { tags: uniqueKeywords } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  }
}
