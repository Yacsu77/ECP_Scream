import React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#0a84ff] hover:bg-[#409cff] active:bg-[#0070d8] text-white shadow-[0_1px_3px_rgba(10,132,255,0.4)]',
  secondary:
    'bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.06] text-white border border-white/[0.08]',
  danger:
    'bg-[#ff453a] hover:bg-[#ff6b62] active:bg-[#d83a30] text-white shadow-[0_1px_3px_rgba(255,69,58,0.4)]',
  ghost:
    'bg-transparent hover:bg-white/[0.06] active:bg-white/[0.04] text-[var(--apple-text-secondary)] hover:text-white',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-7 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-[14px] gap-2 rounded-[10px]',
  lg: 'h-11 px-6 text-[15px] gap-2 rounded-xl',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none',
          'transition-all duration-150 ease-out cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
