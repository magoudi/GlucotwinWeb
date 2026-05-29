type AppTextInputProps = {
  label: string
  value: string
  type?: string
  onChange?: (value: string) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  name?: string
  error?: string
  touched?: boolean
  readOnly?: boolean
}

export function AppTextInput({ label, value, type = 'text', onChange, onBlur, onFocus, name, error, touched = false, readOnly = false }: AppTextInputProps) {
  const showError = touched && error

  return (
    <label className="block">
      <span className="text-base leading-none font-semibold text-[#111111] 2xl:text-[18px]">{label}</span>
      <input
        className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-base text-[#111111] outline-none transition-shadow focus:border-[#2455e8] focus:shadow-[0_0_0_3px_rgba(36,85,232,0.14)] 2xl:mt-3 2xl:h-[72px] 2xl:px-6 2xl:text-[19px] ${
          showError ? 'border-red-400' : 'border-black/10 focus:border-[#2455e8]'
        }`}
        name={name}
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        onBlur={onBlur}
        onFocus={(event) => {
          onFocus?.(event)
          if (!readOnly) {
            event.currentTarget.select()
          }
        }}
      />
      {showError && <p className="mt-2 text-sm font-bold text-red-500">{error}</p>}
    </label>
  )
}
