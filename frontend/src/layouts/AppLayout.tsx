import { type ReactNode, useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { ImpersonationBanner } from '../components/ImpersonationBanner'
import { fetchActiveAnnouncements, type Announcement } from '../lib/adminApi'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    fetchActiveAnnouncements()
      .then(res => setAnnouncements(res.announcements))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-w-0 bg-[#0B1120] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,194,160,0.15),rgba(255,255,255,0))] md:ml-[236px] xl:ml-[260px]">
        <ImpersonationBanner />

        {/* Announcements Banner */}
        {announcements.map(a => (
          <div key={a.id} className={`flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white shadow-md md:px-8 ${
            a.type === 'info' ? 'bg-blue-600' :
            a.type === 'warning' ? 'bg-amber-600' :
            a.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}>
            <span className="mr-2 font-extrabold uppercase opacity-80">[{a.title}]</span> {a.message}
          </div>
        ))}

        <section className="mx-auto flex min-h-screen w-full max-w-[1510px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:gap-9 xl:px-12 xl:py-12 2xl:px-14 2xl:py-14">
          {children}
        </section>
      </main>
    </div>
  )
}
