'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Terminal, 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  LogOut,
  X,
  Users,
  Briefcase,
  Laptop,
  FileCheck,
  Settings
} from 'lucide-react'
import { logout } from '@/app/actions/auth'

interface SidebarProps {
  role: 'admin' | 'technician' | 'manager' | 'end_user'
  fullName: string
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ role, fullName, isOpen, onClose }: SidebarProps) {
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

    if (role === 'manager') {
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
        },
        {
          href: '/manager/approvals',
          label: 'Request Approval',
          icon: FileCheck,
          active: pathname.startsWith('/manager/approvals')
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
        },
        {
          href: '/admin/users',
          label: 'Kelola User',
          icon: Users,
          active: pathname.startsWith('/admin/users')
        },
        {
          href: '/admin/departments',
          label: 'Kelola Dept',
          icon: Briefcase,
          active: pathname.startsWith('/admin/departments')
        },
        {
          href: '/admin/assets',
          label: 'Kelola Aset',
          icon: Laptop,
          active: pathname.startsWith('/admin/assets')
        },
        {
          href: '/admin/settings',
          label: 'Pengaturan Tema',
          icon: Settings,
          active: pathname.startsWith('/admin/settings')
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
      case 'manager':
        return 'Manager'
      default:
        return 'Karyawan'
    }
  }

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      case 'technician':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'manager':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-bg-card border-r border-border-card flex flex-col justify-between h-screen transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-card">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand-primary flex items-center justify-center shadow-md shadow-brand-primary/20">
              <Terminal className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-main tracking-tight">IT Helpdesk</span>
          </div>
          
          {/* Close button for mobile only */}
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-text-muted hover:text-text-main hover:bg-bg-app rounded-lg lg:hidden transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-4.5 border-b border-border-card">
          <div className="bg-bg-app border border-border-card rounded-xl p-3.5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Sedang Aktif</span>
            <span className="text-sm font-semibold text-text-main truncate max-w-xs">{fullName}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit border ${getRoleColor()}`}>
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
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                  item.active
                    ? 'bg-brand-light border border-brand-primary/20 text-brand-text shadow-sm'
                    : 'text-text-muted hover:text-brand-text hover:bg-brand-light/30 border border-transparent'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${item.active ? 'text-brand-primary' : 'text-text-muted'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-border-card">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4.5 py-3 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/25 transition duration-200 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          Keluar (Logout)
        </button>
      </div>
    </aside>
  )
}
