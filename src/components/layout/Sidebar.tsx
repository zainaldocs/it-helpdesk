'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Terminal, 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react'
import { logout } from '@/app/actions/auth'

interface SidebarProps {
  role: 'admin' | 'technician' | 'end_user'
  fullName: string
}

export default function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname()

  const getMenuLinks = () => {
    const baseLinks = [
      {
        href: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        active: pathname === '/'
      }
    ]

    if (role === 'end_user') {
      return [
        ...baseLinks,
        {
          href: '/tickets',
          label: 'Tiket Saya',
          icon: Ticket,
          active: pathname.startsWith('/tickets') && pathname !== '/tickets/create'
        },
        {
          href: '/tickets/create',
          label: 'Buat Tiket Baru',
          icon: PlusCircle,
          active: pathname === '/tickets/create'
        }
      ]
    }

    if (role === 'technician') {
      return [
        ...baseLinks,
        {
          href: '/tickets',
          label: 'Semua Tiket',
          icon: Ticket,
          active: pathname.startsWith('/tickets')
        }
      ]
    }

    if (role === 'admin') {
      return [
        ...baseLinks,
        {
          href: '/tickets',
          label: 'Kelola Tiket',
          icon: Ticket,
          active: pathname.startsWith('/tickets')
        }
      ]
    }

    return baseLinks
  }

  const menuItems = getMenuLinks()

  const handleLogout = async () => {
    await logout()
  }

  const getRoleLabel = () => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'technician':
        return 'IT Support'
      default:
        return 'Karyawan'
    }
  }

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      case 'technician':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    }
  }

  return (
    <aside className="w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-900/60">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Terminal className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">IT Helpdesk</span>
        </div>

        {/* User Card */}
        <div className="px-4 py-4.5 border-b border-slate-900/60">
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3.5 flex flex-col gap-1.5">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sedang Aktif</span>
            <span className="text-sm font-semibold text-white truncate max-w-xs">{fullName}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${getRoleColor()}`}>
              {getRoleLabel()}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                  item.active
                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-900/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4.5 py-3 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-transparent hover:border-rose-950/30 transition duration-200 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          Keluar (Logout)
        </button>
      </div>
    </aside>
  )
}
