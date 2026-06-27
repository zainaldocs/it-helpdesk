import { getTickets } from '@/app/actions/tickets'
import { getCurrentUser } from '@/app/actions/auth'
import TicketList from '@/components/tickets/TicketList'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export default async function TicketsPage() {
  const user = await getCurrentUser()
  const tickets = await getTickets()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Daftar Tiket IT</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.profile?.role === 'end_user'
              ? 'Daftar keluhan IT yang Anda laporkan.'
              : 'Daftar semua keluhan IT dari pengguna.'}
          </p>
        </div>
        {user?.profile?.role === 'end_user' && (
          <Link
            href="/tickets/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/10 transition cursor-pointer w-fit"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Buat Tiket Baru
          </Link>
        )}
      </div>

      {/* Renders client-side list with search & filter */}
      <TicketList initialTickets={tickets} role={user?.profile?.role || 'end_user'} />
    </div>
  )
}
