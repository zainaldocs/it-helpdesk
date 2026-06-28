'use client'

import { useState, useEffect } from 'react'
import { getDepartmentPendingTickets, approveTicket, cancelTicket } from '@/app/actions/tickets'
import { Check, X, Loader2, Inbox, Ticket, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function ApprovalsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null) // track loading for specific ticket buttons

  useEffect(() => {
    fetchPendingTickets()
  }, [])

  const fetchPendingTickets = async () => {
    setIsLoading(true)
    const data = await getDepartmentPendingTickets()
    setTickets(data)
    setIsLoading(false)
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui tiket ini untuk diteruskan ke IT Support?')) return
    setActionId(id)
    const result = await approveTicket(id)
    setActionId(null)
    if (result.error) {
      alert('Gagal menyetujui tiket: ' + result.error)
    } else {
      fetchPendingTickets()
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan tiket ini?')) return
    setActionId(id)
    const result = await cancelTicket(id)
    setActionId(null)
    if (result.error) {
      alert('Gagal membatalkan tiket: ' + result.error)
    } else {
      fetchPendingTickets()
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-50 text-red-700 border border-red-200'
      case 'high':
        return 'bg-orange-50 text-orange-700 border border-orange-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      default:
        return 'bg-purple-50 text-purple-700 border border-purple-200'
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            Persetujuan Tiket (Request Approvals)
          </h1>
          <p className="text-sm text-slate-500 font-medium">Daftar aduan karyawan departemen Anda yang membutuhkan persetujuan Anda sebelum diproses oleh tim IT.</p>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="text-sm font-medium">Memuat pengajuan tiket...</span>
          </div>
        ) : tickets.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/50 transition duration-200"
              >
                <div className="space-y-2.5 flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{ticket.ticket_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getUrgencyBadge(ticket.urgency)}`}>
                      {ticket.urgency}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold">
                      Kategori: {ticket.category}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{ticket.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">{ticket.description}</p>
                  
                  {ticket.asset && (
                    <div className="text-xs font-semibold text-slate-700 bg-slate-100/75 border border-slate-200/50 rounded-lg px-2.5 py-1.5 w-fit flex items-center gap-1.5">
                      <span className="text-slate-400">Aset Bermasalah:</span>
                      <span className="font-mono font-bold text-purple-700">{ticket.asset.asset_code}</span>
                      <span>-</span>
                      <span>{ticket.asset.name}</span>
                    </div>
                  )}

                  <div className="text-[10px] font-medium text-slate-400 flex items-center gap-2 pt-1">
                    <span>Pengaju: <strong>{ticket.creator?.full_name}</strong> ({ticket.creator?.email})</span>
                    <span>•</span>
                    <span>Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto pt-4 md:pt-0 border-t border-slate-100 md:border-0 justify-end">
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleReject(ticket.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer w-full md:w-auto"
                  >
                    {actionId === ticket.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Batal (Cancel)
                  </button>
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleApprove(ticket.id)}
                    className="flex items-center justify-center gap-1.5 px-4.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/15 disabled:opacity-50 cursor-pointer w-full md:w-auto"
                  >
                    {actionId === ticket.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Setujui (Approve)
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tidak Ada Pengajuan</h3>
              <p className="text-xs text-slate-500 mt-1">Saat ini tidak ada tiket dari departemen Anda yang memerlukan persetujuan.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
