import React from "react"
import { motion } from "framer-motion"

/**
 * Tones, not colors.
 *
 * `primary` is a Deep Coffee block with Soft Peach ink — brandbook §1.2's
 * pairing for anything set on the dark ground, at 11.2:1. It is the only
 * solid mass on a page made of hairlines, which is what makes it read as
 * the next step; everything else is deliberately quiet.
 *
 * The hover lifts the block toward Base Sand rather than darkening it —
 * Deep Coffee is already the darkest value the brand has.
 */
export type ButtonTone = "primary" | "neutral" | "ghost"

const TONE_CLASS: Record<ButtonTone, string> = {
  primary: "bg-fg text-ink-on-dark hover:bg-muted",
  neutral: "border border-rule/30 text-fg hover:border-rule/60",
  ghost: "border border-rule/20 text-muted hover:border-rule/50 hover:text-fg"
}

const SIZE_CLASS = {
  sm: "gap-1.5 px-4 py-2 text-sm",
  md: "gap-2 px-6 py-3 text-base",
  lg: "gap-2.5 px-9 py-4 text-lg"
} as const

interface ButtonProps {
  children?: React.ReactNode
  tone?: ButtonTone
  size?: keyof typeof SIZE_CLASS
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  onClick?: () => void
  /** Defaults to "button" so a Button inside a <form> never submits by accident. */
  type?: "button" | "submit"
}

const Button: React.FC<ButtonProps> = ({
  icon,
  iconRight,
  tone = "primary",
  size = "md",
  className,
  children,
  disabled,
  onClick,
  type = "button"
}) => (
  <motion.button
    type={type}
    whileHover={disabled ? undefined : { scale: 1.03 }}
    whileTap={disabled ? undefined : { scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 22 }}
    disabled={disabled}
    onClick={onClick}
    className={`relative inline-flex items-center justify-center rounded-full font-semibold tracking-[-0.02em] uppercase transition-colors ${SIZE_CLASS[size]} ${TONE_CLASS[tone]}
      ${disabled ? "cursor-not-allowed opacity-50 shadow-none" : "cursor-pointer"}
      ${className ?? ""}`}
  >
    {icon && <span className="inline-flex items-center">{icon}</span>}
    {children && <span>{children}</span>}
    {iconRight && <span className="inline-flex items-center">{iconRight}</span>}
  </motion.button>
)

export default Button
