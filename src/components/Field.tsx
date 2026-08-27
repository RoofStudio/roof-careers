import React from "react"
import { useTranslation } from "react-i18next"

interface FieldProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  /** Translated message, or "" when the field is fine. */
  error?: string
  optional?: boolean
  type?: "text" | "email" | "url" | "tel"
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}

const Field: React.FC<FieldProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  optional,
  type = "text",
  autoComplete,
  inputMode
}) => {
  const { t } = useTranslation()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline gap-2 text-base font-semibold text-fg">
        {label}
        {optional && <span className="label normal-case">{t("form.optional")}</span>}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        /**
         * Derived from `optional`, not a second prop. Every field on this form
         * is one or the other — the optional ones already say so next to their
         * label — so a separate `required` flag would only be a chance for the
         * two to disagree.
         *
         * The form carries `noValidate`, so this does not hand submission back
         * to the browser: `validate()` still owns the messages and the
         * scroll-to-first-problem. What it buys is the contract being IN the
         * markup — a screen reader announces the field as required, which it
         * had no way of knowing before.
         */
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-field border bg-transparent px-4 py-3 text-base text-fg transition-colors placeholder:text-faint
          ${error ? "border-negative" : "border-rule/30 hover:border-rule/60"}`}
      />

      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-negative">
          {error}
        </p>
      )}
    </div>
  )
}

export default Field
