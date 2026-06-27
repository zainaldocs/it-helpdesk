import { getTicketById, getTechnicians } from '@/app/actions/tickets'
import { getCurrentUser } from '@/app/actions/auth'
import { getNotes } from '@/app/actions/notes'
import TicketDetailClient from '@/components/tickets/TicketDetail'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params

  const [ticket, currentUser, notes, technicians] = await Promise.all([
    getTicketById(id),
    getCurrentUser(),
    getNotes(id),
    getTechnicians()
  ])

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pt-10">
        <Link 
          href="/tickets" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Tiket
        </Link>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 bg-red-950/20 rounded-2xl border border-red-900/30 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Tiket Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tiket yang Anda cari mungkin telah dihapus atau Anda tidak memiliki akses ke tiket ini.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Link 
        href="/tickets" 
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Tiket
      </Link>

      <TicketDetailClient
        ticket={ticket}
        currentUser={currentUser}
        initialNotes={notes}
        technicians={technicians}
      />
    </div>
  )
}
