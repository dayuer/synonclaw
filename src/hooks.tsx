import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

/* ========== ScrollReveal Hook ========== */

export function useScrollReveal<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, isVisible]
}

/* ========== ScrollReveal 包装组件 ========== */

export function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ========== 表单验证 ========== */

export interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  message: string
}

export function useFormValidation<T extends Record<string, string>>(
  rules: Record<keyof T, ValidationRule[]>
) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const validate = useCallback(
    (values: T): boolean => {
      const newErrors: Partial<Record<keyof T, string>> = {}
      let isValid = true

      for (const [field, fieldRules] of Object.entries(rules) as [keyof T, ValidationRule[]][]) {
        for (const rule of fieldRules) {
          const value = values[field]
          if (rule.required && !value?.trim()) {
            newErrors[field] = rule.message
            isValid = false
            break
          }
          if (rule.pattern && value && !rule.pattern.test(value)) {
            newErrors[field] = rule.message
            isValid = false
            break
          }
        }
      }

      setErrors(newErrors)
      return isValid
    },
    [rules]
  )

  const clearErrors = useCallback(() => setErrors({}), [])

  return { errors, validate, clearErrors }
}
