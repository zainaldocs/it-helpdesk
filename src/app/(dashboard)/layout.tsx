import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient'
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

  if (user.profile.account_status === 'pending') {
    redirect('/waiting-approval')
  }

  if (user.profile.account_status === 'suspended') {
    redirect('/suspended')
  }

  return (
    <DashboardLayoutClient 
      userRole={user.profile.role} 
      userFullName={user.profile.full_name}
      userEmail={user.email || ''}
    >
      {children}
    </DashboardLayoutClient>
  )
}
