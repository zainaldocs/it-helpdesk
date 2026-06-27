import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || !user.profile) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar role={user.profile.role} fullName={user.profile.full_name} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar email={user.email || ''} />
        <main className="flex-1 p-8 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}
