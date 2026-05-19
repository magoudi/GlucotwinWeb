import { type ReactNode } from 'react'
import { AdminSidebar } from '../components/AdminSidebar'
import { ImpersonationBanner } from '../components/ImpersonationBanner'

type AdminLayoutProps = {
  children: ReactNode
}



export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <main className="min-w-0 bg-[#0B1120] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.12),rgba(255,255,255,0))] md:ml-[236px] xl:ml-[260px]">
        <ImpersonationBanner />
        <section className="mx-auto flex min-h-screen w-full max-w-[1510px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:gap-9 xl:px-12 xl:py-12 2xl:px-14 2xl:py-14">
          {children}
        </section>
      </main>
    </div>
  )
}
