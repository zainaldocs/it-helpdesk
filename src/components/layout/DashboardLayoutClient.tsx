'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

interface DashboardLayoutClientProps {
  userRole: 'admin' | 'technician' | 'manager' | 'end_user'
  userFullName: string
  userEmail: string
  children: React.ReactNode
}

export default function DashboardLayoutClient({
  userRole,
  userFullName,
  userEmail,
  children
}: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleOpenMenu = () => setIsSidebarOpen(true)
  const handleCloseMenu = () => setIsSidebarOpen(false)

  // Close sidebar on route change for mobile users
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-bg-app text-text-main">
      <Sidebar 
        role={userRole} 
        fullName={userFullName} 
        isOpen={isSidebarOpen} 
        onClose={handleCloseMenu} 
      />
      
      {/* Dark Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={handleCloseMenu}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        <Navbar email={userEmail} onOpenMenu={handleOpenMenu} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-bg-app relative">
          {children}
        </main>
      </div>
    </div>
  )
}
