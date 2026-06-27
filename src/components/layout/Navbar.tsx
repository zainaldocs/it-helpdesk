'use client'

import { Bell, Calendar, User } from 'lucide-react'
import { useEffect, useState } from 'react'

interface NavbarProps {
  email: string
}

export default function Navbar({ email }: NavbarProps) {
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
    <header className="h-16 border-b border-slate-900/60 bg-slate-950/40 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Date */}
      <div className="flex items-center gap-2.5 text-slate-400 text-sm">
        <Calendar className="h-4 w-4 text-slate-500" />
        <span>{currentDate}</span>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-5">
        {/* Notification Icon */}
        <button className="relative p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-transparent hover:border-slate-800 transition cursor-pointer">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        {/* User profile dropdown indicator */}
        <div className="flex items-center gap-3 border-l border-slate-900 pl-5">
          <div className="h-8.5 w-8.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-300 truncate max-w-[150px]">{email}</span>
            <span className="text-[10px] text-slate-500">Koneksi Aman</span>
          </div>
        </div>
      </div>
    </header>
  )
}
