type FormInputProps = {
  label: string
  type: string
  placeholder: string
  name?: string
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  error?: string
  touched?: boolean
  className?: string
  showPasswordToggle?: boolean
  isPasswordVisible?: boolean
  onTogglePassword?: () => void
}

export function FormInput({
  label,
  type,
  placeholder,
  name,
  defaultValue,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  touched,
  className,
  showPasswordToggle,
  isPasswordVisible,
  onTogglePassword,
}: FormInputProps) {
  const showError = touched && error
  const isPasswordField = type === 'password'
  const inputType = isPasswordField && showPasswordToggle && isPasswordVisible ? 'text' : type

  return (
    <label className={`block ${className ?? ''}`}>
      <span className="text-base leading-none font-semibold text-[#111111] 2xl:text-[18px]">{label}</span>
      <div className="relative mt-2">
        <input
          className={`h-12 w-full rounded-xl border bg-white px-4 pr-12 text-base text-[#111111] outline-none transition-shadow placeholder:text-[#aaaaaa] focus:border-[#2455e8] focus:shadow-[0_0_0_3px_rgba(36,85,232,0.14)] 2xl:h-[72px] 2xl:px-6 2xl:text-[19px] ${
            showError ? 'border-rose-400' : 'border-black/10'
          }`}
          name={name}
          type={inputType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        {showPasswordToggle && isPasswordField && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#f5f4f0] px-3 py-2 text-xs font-semibold text-[#2455e8] transition hover:bg-[#e8eeff]"
            onClick={onTogglePassword}
          >
            {isPasswordVisible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {showError && <p className="mt-2 text-sm font-bold text-rose-500">{error}</p>}
    </label>
  )
}
