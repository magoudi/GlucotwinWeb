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
}

export function FormInput({ label, type, placeholder, name, defaultValue, value, onChange, onBlur, onFocus, error, touched }: FormInputProps) {
  const showError = touched && error

  return (
    <label className="block">
      <span className="text-base leading-none font-extrabold text-slate-300 2xl:text-[18px]">{label}</span>
      <input
        className={`mt-2 h-12 w-full rounded-lg border bg-white/5 backdrop-blur-sm px-4 text-base text-white outline-none transition-shadow placeholder:text-slate-500 focus:border-cyan-500 focus:shadow-[0_0_0_4px_rgba(37,194,160,0.2)] 2xl:mt-3 2xl:h-[72px] 2xl:px-6 2xl:text-[19px] ${
          showError ? 'border-red-300' : 'border-white/10'
        }`}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onBlur={onBlur}
        onFocus={(event) => {
          onFocus?.(event)
          if (!event.currentTarget.readOnly) {
            event.currentTarget.select()
          }
        }}
      />
      {showError && <p className="mt-2 text-sm font-bold text-rose-400">{error}</p>}
    </label>
  )
}
