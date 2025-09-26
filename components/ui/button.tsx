import * as React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline'
}

export function Button({ className = '', variant = 'default', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2'
  const variants = {
    default: 'bg-foreground text-background hover:opacity-90',
    outline: 'border border-border hover:bg-accent',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

