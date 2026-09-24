/**
 * Shared Houzeify button — thin wrapper around the shadcn preset Button.
 * Prefer importing from here for app chrome; `@/components/ui/button` remains
 * the primitive. No second visual system.
 */
import { Button as ShadcnButton, buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

type ShadcnVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>

const LEGACY_TO_SHADCN: Record<string, ShadcnVariant> = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
  destructive: 'destructive',
}

export type ButtonProps = Omit<ComponentProps<typeof ShadcnButton>, 'variant'> & {
  /** Accepts shadcn variants or legacy Houzeify names (primary/secondary/…). */
  variant?: ShadcnVariant | 'primary' | 'secondary'
}

export default function Button({ variant = 'default', className, ...props }: ButtonProps) {
  const resolved =
    variant && variant in LEGACY_TO_SHADCN
      ? LEGACY_TO_SHADCN[variant]
      : (variant as ShadcnVariant | undefined)

  return (
    <ShadcnButton
      variant={resolved}
      className={['min-h-11 cursor-pointer', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export { buttonVariants }
