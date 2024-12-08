import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import { useMathJax } from '@/hooks/useMathJax'

interface LatexRendererProps {
  content: string
  className?: string
  inline?: boolean
}

export const LatexRenderer = React.memo(({ content, className = '', inline = false }: LatexRendererProps) => {
  const { mathJaxLoaded, typeset } = useMathJax()
  const contentRef = useRef<HTMLSpanElement>(null)

  const preprocessedContent = useMemo(() => {
    if (!content) return '';

    let processed = content
      .replace(/\\\[/g, '$$')
      .replace(/\\\]/g, '$$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$')
      .replace(/\\begin\{aligned\}/g, '\\begin{aligned}')
      .replace(/\\end\{aligned\}/g, '\\end{aligned}')
      .replace(/\\sqrt/g, '\\sqrt')
      .replace(/\\frac/g, '\\frac')
      .replace(/\\log/g, '\\log')
      .replace(/\\cos/g, '\\cos')
      .replace(/\\sin/g, '\\sin')
      .replace(/\\tan/g, '\\tan')
      .replace(/\\%/g, '%')
      .replace(/\\_/g, '_')
      .replace(/\\quad/g, '\\;')

    if (inline) {
      processed = processed.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    } else {
      processed = processed.split('\n').map(line => line.trim()).join('\n')
    }

    return processed
  }, [content, inline])

  const memoizedTypeset = useCallback(() => {
    if (mathJaxLoaded && contentRef.current) {
      typeset(contentRef.current)
    }
  }, [mathJaxLoaded, typeset])

  useEffect(() => {
    memoizedTypeset()
  }, [memoizedTypeset, preprocessedContent])

  return (
    <span
      ref={contentRef}
      className={`latex-content ${inline ? 'inline' : 'block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: preprocessedContent }}
    />
  )
})

LatexRenderer.displayName = 'LatexRenderer'

