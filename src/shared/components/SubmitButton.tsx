import type { ComponentProps } from 'react'
import { LoaderCircleIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'

interface SubmitButtonProps extends Omit<ComponentProps<typeof Button>, 'type' | 'disabled' | 'asChild'> {
  /** While true the button shows `pendingLabel` with a spinner and cannot be pressed again. */
  pending: boolean
  pendingLabel: string
}

/** A form's primary action, with a busy state that prevents double submission. */
export function SubmitButton({ pending, pendingLabel, children, ...buttonProps }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending} aria-busy={pending || undefined} {...buttonProps}>
      {pending && <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" />}
      {pending ? pendingLabel : children}
    </Button>
  )
}
