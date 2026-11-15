const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.5 8.07 7.4 5 12 5s8.5 3.07 9.94 6.65a1 1 0 0 1 0 .7C20.5 15.93 16.6 19 12 19s-8.5-3.07-9.94-6.65" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function EyeOffIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10.73 5.08A10.7 10.7 0 0 1 12 5c4.6 0 8.5 3.07 9.94 6.65a1 1 0 0 1 0 .7 10.8 10.8 0 0 1-1.44 2.49" />
      <path d="M14.08 14.16a3 3 0 0 1-4.24-4.24" />
      <path d="M17.48 17.5A10.7 10.7 0 0 1 12 19c-4.6 0-8.5-3.07-9.94-6.65a1 1 0 0 1 0-.7 10.8 10.8 0 0 1 4.45-5.14" />
      <path d="m2 2 20 20" />
    </svg>
  )
}

export function ArrowLeftIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg {...iconProps} width={22} height={22} strokeWidth={2.25}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
