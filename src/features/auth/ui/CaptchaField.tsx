import type { ComponentProps } from 'react'
import { RefreshCwIcon } from 'lucide-react'
import { FormField } from '@/shared/components/FormField'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import type { CaptchaState } from './useCaptcha'

interface CaptchaFieldProps {
  state: CaptchaState
  onRefresh: () => void
  error?: string
  /** Props that connect the text input to the form, e.g. React Hook Form's `register(...)`. */
  inputProps: ComponentProps<typeof Input>
}

/** The captcha picture, a button for a different one, and the box to type its characters into. */
export function CaptchaField({ state, onRefresh, error, inputProps }: CaptchaFieldProps) {
  return (
    <FormField id="sign-in-captcha" label="Security code" error={error}>
      {(controlProps) => (
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-12 flex-1 items-center justify-center overflow-hidden rounded-md border bg-background">
              {state.status === 'ready' && (
                <img src={state.captcha.image} alt="Security code to type" className="h-full w-auto object-contain" />
              )}
              {state.status === 'loading' && <Skeleton aria-hidden className="size-full rounded-none" />}
              {state.status === 'failed' && (
                <p className="px-3 text-sm text-muted-foreground">We couldn’t load the picture.</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={state.status === 'loading'}
              aria-label="Show a new picture"
              className="size-12"
            >
              <RefreshCwIcon />
            </Button>
          </div>
          <Input
            {...controlProps}
            {...inputProps}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-10"
          />
        </div>
      )}
    </FormField>
  )
}
