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
      <span className="text-[17px] font-extrabold text-slate-300">{label}</span>
      <input
        className={`mt-2 h-[56px] w-full rounded-xl border bg-white/5 backdrop-blur-sm px-4 text-[18px] font-semibold text-white outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(37,194,160,0.2)] ${
          showError ? 'border-red-300' : 'border-white/10 focus:border-cyan-500'
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
      {showError && <p className="mt-2 text-sm font-bold text-red-700">{error}</p>}
    </label>
  )
}
