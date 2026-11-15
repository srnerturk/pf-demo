import { SearchIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'

interface SearchInputProps extends Omit<ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> {
  /** Accessible name; search boxes usually have no visible label. */
  label: string
  value: string
  onValueChange(value: string): void
}

/** A search box with a leading magnifier icon. */
export function SearchInput({ label, value, onValueChange, className, ...inputProps }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        {...inputProps}
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="pl-9"
      />
    </div>
  )
}
