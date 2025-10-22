/**
 * Button Component - Universal Interactive Element
 * 
 * FLAT FIRST design - no shadows, no lift effects.
 * Uses semantic color tokens for all variants.
 * 100% theme-aware (light/dark).
 * 
 * Usage:
 *   <Button>Click me</Button>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="danger" size="lg">Delete</Button>
 *   <Button variant="ghost" leftIcon={<Icon />}>With Icon</Button>
 * 
 * Variants:
 *   - primary: Main actions (default)
 *   - secondary: Outlined, less emphasis
 *   - ghost: Minimal, transparent
 *   - danger: Destructive actions
 *   - success: Confirmations
 *   - warning: Caution
 *   - info: Informational
 *   - link: Text-only
 * 
 * Sizes:
 *   - sm: 32px (desktop), 40px (mobile)
 *   - md: 40px (desktop), 48px (mobile) - default
 *   - lg: 48px (desktop), 56px (mobile)
 */

import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  iconOnly?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  type?: 'button' | 'submit' | 'reset'
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  leftIcon,
  rightIcon,
  disabled = false,
  loading = false,
  children,
  className = '',
  onClick,
  type = 'button',
  as: Component = 'button',
  href,
  target,
  rel,
}) => {
  const classes = [
    'ds-btn',
    variant !== 'primary' && `ds-btn--${variant}`,
    size !== 'md' && `ds-btn--${size}`,
    fullWidth && 'ds-btn--full',
    iconOnly && 'ds-btn--icon',
    className,
  ].filter(Boolean).join(' ')
  
  const content = (
    <>
      {loading && (
        <span className="ds-btn__spinner" aria-hidden="true">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      {!loading && leftIcon && (
        <span className="ds-btn__icon-left" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="ds-btn__content">
        {children}
      </span>
      {!loading && rightIcon && (
        <span className="ds-btn__icon-right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>
  )
  
  // Add semantic role for Gestalt-aware spacing
  const role = variant === 'primary' ? 'cta' : undefined
  
  if (Component === 'a') {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        className={classes}
        aria-disabled={disabled || loading}
        onClick={disabled || loading ? (e) => e.preventDefault() : onClick}
        data-ds-role={role}
      >
        {content}
      </a>
    )
  }
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      data-ds-role={role}
    >
      {content}
    </button>
  )
}
