import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

/** Label + control + optional hint or error, with the error announced to screen readers. */
export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string | null
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : (
        hint && <p className="text-muted-foreground text-sm">{hint}</p>
      )}
    </div>
  )
}
