"use client"

import * as React from 'react'
import { useMDXComponent } from 'next-contentlayer/hooks'
import { mdxComponents } from './mdx-components'

export function Mdx({ code }: { code: string }) {
  const Component = useMDXComponent(code)
  return <Component components={mdxComponents as any} />
}

