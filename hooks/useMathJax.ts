import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    MathJax: never;
  }
}

export function useMathJax() {
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false)
    const mathJaxRef = useRef<never>(null)

    useEffect(() => {
      if (window.MathJax) {
        mathJaxRef.current = window.MathJax
        setMathJaxLoaded(true)
      } else {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
        script.async = true
        script.onload = () => {
          // @ts-expect-error It's Okay
            window.MathJax.Hub.Config({
            tex2jax: {
              inlineMath: [['$', '$'], ['\$$', '\$$']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true,
              processEnvironments: true
            },
            "HTML-CSS": {
              linebreaks: { automatic: true },
              scale: 100,
              styles: {
                ".MathJax_Display": { margin: "1em 0" }
              }
            },
            SVG: {
              linebreaks: { automatic: true },
              scale: 100
            }
          })
          mathJaxRef.current = window.MathJax
          setMathJaxLoaded(true)
        }
        document.head.appendChild(script)
      }
    }, [])

    const typeset = (element?: HTMLElement) => {
      if (mathJaxLoaded && mathJaxRef.current) {
        if (element) {
          mathJaxRef.current.Hub.Queue(['Typeset', mathJaxRef.current.Hub, element])
        } else {
          mathJaxRef.current.Hub.Queue(['Typeset', mathJaxRef.current.Hub])
        }
      }
    }

    return { mathJaxLoaded, typeset }
  }

