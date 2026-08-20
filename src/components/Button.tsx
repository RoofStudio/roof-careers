import React from "react"
import { motion } from "framer-motion"

/**
 * Tones, not colors.
 *
 * `primary` is the lime — the brand's action color, always paired with dark
 * ink (the pair holds in both themes). Everything else is deliberately quiet
 * so the page has exactly one obvious next step.
 */
export type ButtonTone = "primary" | "neutral" | "ghost"

const TONE_CLASS: Record<ButtonTone, string> = {
  primary: "bg-accent text-ink-on shadow-soft hover:bg-accent-strong",
  neutral: "bg-panel text-fg border border-line shadow-soft hover:border-line-strong",
  ghost: "bg-transparent border border-line text-muted hover:border-line-strong hover:text-fg"
}

const SIZE_CLASS = {
  sm: "gap-1.5 px-3 py-1.5 text-xs",
  md: "gap-2 px-5 py-2.5 text-sm",
  lg: "gap-2 px-7 py-3.5 text-base"
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
    className={`relative inline-flex items-center justify-center rounded-full font-semibold transition-colors ${SIZE_CLASS[size]} ${TONE_CLASS[tone]}
      ${disabled ? "cursor-not-allowed opacity-50 shadow-none" : "cursor-pointer"}
      ${className ?? ""}`}
  >
    {icon && <span className="inline-flex items-center">{icon}</span>}
    {children && <span>{children}</span>}
    {iconRight && <span className="inline-flex items-center">{iconRight}</span>}
  </motion.button>
)

export default Button
