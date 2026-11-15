import { ImageIcon, UploadIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/button'
import { FormField } from './FormField'

interface ImageFileFieldProps {
  id: string
  label: string
  /** Native `accept` filter, e.g. `image/png,image/jpeg`. The rules still decide what is valid. */
  accept: string
  value: File | null
  onChange(file: File | null): void
  hint?: string
  error?: string
}

/** Picks one image, shows a preview with its name and size, and lets the person replace or remove it. */
export function ImageFileField({ id, label, accept, value, onChange, hint, error }: ImageFileFieldProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = usePreviewUrl(value)

  const remove = () => {
    if (inputRef.current) inputRef.current.value = ''
    onChange(null)
  }

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      {(controlProps) => (
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-muted-foreground">
            {previewUrl ? (
              <img src={previewUrl} alt={t('form.imagePreview')} className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-6" aria-hidden />
            )}
          </div>
          <div className="grid min-w-0 gap-1.5">
            {value && (
              <p className="truncate text-sm">
                <span className="font-medium">{value.name}</span>{' '}
                <span className="text-muted-foreground">· {Math.ceil(value.size / 1024)} KB</span>
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                <UploadIcon aria-hidden />
                {value ? t('form.replaceImage') : t('form.chooseImage')}
              </Button>
              {value && (
                <Button type="button" variant="ghost" size="sm" onClick={remove}>
                  <XIcon aria-hidden />
                  {t('form.removeImage')}
                </Button>
              )}
            </div>
          </div>
          <input
            {...controlProps}
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />
        </div>
      )}
    </FormField>
  )
}

/** A data URL for showing `file`, read in the background; `null` until it is ready or when there is no file. */
function usePreviewUrl(file: File | null): string | null {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)

  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview({ file, url: String(reader.result) })
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])

  return preview?.file === file ? preview.url : null
}
