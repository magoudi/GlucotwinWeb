import { type ReactNode } from 'react'
import { DoctorSidebar } from '../components/DoctorSidebar'
import { ImpersonationBanner } from '../components/ImpersonationBanner'

type DoctorLayoutProps = {
  children: ReactNode
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  return (
    <div className="min-h-screen">
      <DoctorSidebar />
      <main className="min-w-0 bg-[#0B1120] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.12),rgba(255,255,255,0))] md:ml-[236px] xl:ml-[260px]">
        <ImpersonationBanner />
        <section className="mx-auto flex min-h-screen w-full max-w-[1510px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:gap-9 xl:px-12 xl:py-12 2xl:px-14 2xl:py-14">
          {children}
        </section>
      </main>
    </div>
  )
}
