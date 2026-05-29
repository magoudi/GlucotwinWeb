import { Link } from 'react-router-dom'

type PublicNavSection = {
  id: string
  label: string
}

type PublicNavProps = {
  activeSection?: string
  dark?: boolean
  sections?: PublicNavSection[]
}

const defaultSections: PublicNavSection[] = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'results', label: 'Results' },
  { id: 'faq', label: 'FAQ' },
]

export function PublicNav({ activeSection, sections = defaultSections }: PublicNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 pt-4 sm:px-6 lg:px-8">

        {/* Logo pill */}
        <Link
          aria-label="GlucoTwin home"
          className="flex items-center gap-2.5 rounded-full border border-black/8 bg-white px-4 py-2.5 shadow-[0_2px_12px_rgba(17,17,17,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_18px_rgba(17,17,17,0.12)]"
          to="/"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-full border border-black/8 bg-[#f5f4f0] text-[16px] text-[#111111]">
            ⬡
          </span>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-[#111111] sm:text-[18px]">
            GlucoTwin
          </span>
        </Link>

        {/* Center nav pill — dark background */}
        <nav className="hidden items-center gap-0.5 rounded-full bg-[#111111] p-1.5 shadow-[0_4px_20px_rgba(17,17,17,0.18)] lg:flex">
          {sections.map((section) => {
            const isActive = activeSection === section.id
            return (
              <a
                key={section.id}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold tracking-[0.01em] transition ${
                  isActive
                    ? 'bg-white text-[#111111] shadow-sm'
                    : 'text-gray-900/70 hover:bg-gray-100 hover:text-gray-900'
                }`}
                href={`#${section.id}`}
              >
                {section.label}
              </a>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            className="hidden text-[14px] font-semibold text-[#555555] transition hover:text-[#111111] sm:inline-flex"
            href="#faq"
          >
            Questions
          </a>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-[#2455e8] px-5 py-2.5 text-[14px] font-bold text-gray-900 shadow-[0_4px_18px_rgba(36,85,232,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1a44cc] hover:shadow-[0_6px_24px_rgba(36,85,232,0.36)] sm:px-6"
            to="/create-account"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
