'use client'

import { Bell, Calendar, User, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'

interface NavbarProps {
  email: string
  onOpenMenu?: () => void
}

export default function Navbar({ email, onOpenMenu }: NavbarProps) {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    setCurrentDate(today.toLocaleDateString('id-ID', options))
  }, [])

  return (
    <header className="h-16 border-b border-border-card bg-bg-card/85 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu (Mobile Only) */}
        {onOpenMenu && (
          <button 
            onClick={onOpenMenu}
            className="p-2 -ml-2 text-text-muted hover:text-brand-text hover:bg-bg-app rounded-lg lg:hidden transition"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Date */}
        <div className="flex items-center gap-2.5 text-text-muted text-sm">
          <Calendar className="h-4 w-4 text-brand-primary" />
          <span className="hidden sm:block font-medium">{currentDate}</span>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4 md:gap-5">
        {/* Notification Icon */}
        <button className="relative p-2 hover:bg-bg-app text-text-muted hover:text-brand-text rounded-lg transition cursor-pointer">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-bg-card" />
        </button>

        {/* User profile dropdown indicator */}
        <div className="flex items-center gap-3 border-l border-border-card pl-4 md:pl-5">
          <div className="h-8.5 w-8.5 rounded-full bg-brand-light border border-brand-primary/10 flex items-center justify-center text-brand-text shadow-sm">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-text-main truncate max-w-[150px]">{email}</span>
            <span className="text-[10px] text-text-muted font-medium">Koneksi Aman</span>
          </div>
        </div>
      </div>
    </header>
  )
}
