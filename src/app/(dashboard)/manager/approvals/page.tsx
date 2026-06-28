'use client'

import { useState, useEffect } from 'react'
import { getDepartmentPendingTickets, approveTicket, cancelTicket } from '@/app/actions/tickets'
import { Check, X, Loader2, Inbox, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function ApprovalsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null) // track loading for specific ticket buttons

  useEffect(() => {
    fetchPendingTickets()
  }, [])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Reset page when tickets update
  useEffect(() => {
    setCurrentPage(1)
  }, [tickets])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTickets = tickets.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(tickets.length / itemsPerPage)

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
        return 'bg-red-500/10 text-red-500 border border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
      default:
        return 'bg-brand-light text-brand-text border border-brand-primary/20'
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-primary" />
            Persetujuan Tiket (Request Approvals)
          </h1>
          <p className="text-sm text-text-muted font-medium">Daftar aduan karyawan departemen Anda yang membutuhkan persetujuan Anda sebelum diproses oleh tim IT.</p>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-bg-card border border-border-card rounded-2xl shadow-sm overflow-hidden transition duration-200">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <span className="text-sm font-medium">Memuat pengajuan tiket...</span>
          </div>
        ) : tickets.length > 0 ? (
          <div className="divide-y divide-border-card">
            {currentTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-bg-app/50 transition duration-200"
              >
                <div className="space-y-2.5 flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-text-muted">{ticket.ticket_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getUrgencyBadge(ticket.urgency)}`}>
                      {ticket.urgency}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-app border border-border-card text-text-main font-bold">
                      Kategori: {ticket.category}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-text-main leading-snug">{ticket.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2 font-medium">{ticket.description}</p>
                  
                  {ticket.asset && (
                    <div className="text-xs font-semibold text-text-main bg-bg-app border border-border-card rounded-lg px-2.5 py-1.5 w-fit flex items-center gap-1.5">
                      <span className="text-text-muted font-normal">Aset Bermasalah:</span>
                      <span className="font-mono font-bold text-brand-text">{ticket.asset.asset_code}</span>
                      <span>-</span>
                      <span>{ticket.asset.name}</span>
                    </div>
                  )}

                  <div className="text-[10px] font-medium text-text-muted flex items-center gap-2 pt-1">
                    <span>Pengaju: <strong>{ticket.creator?.full_name}</strong> ({ticket.creator?.email})</span>
                    <span>•</span>
                    <span>Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto pt-4 md:pt-0 border-t border-border-card md:border-0 justify-end">
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleReject(ticket.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-border-card bg-bg-app hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 text-text-muted rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer w-full md:w-auto"
                  >
                    {actionId === ticket.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Batal (Cancel)
                  </button>
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleApprove(ticket.id)}
                    className="flex items-center justify-center gap-1.5 px-4.5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-primary/15 disabled:opacity-50 cursor-pointer w-full md:w-auto"
                  >
                    {actionId === ticket.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Setujui (Approve)
                  </button>
                </div>
              </div>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4.5 bg-bg-app border-t border-border-card text-xs">
                <div className="text-text-muted font-semibold">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, tickets.length)} dari {tickets.length} pengajuan
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 border border-border-card bg-bg-card hover:bg-bg-app text-text-main font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3.5 py-2 border border-border-card bg-bg-card hover:bg-bg-app text-text-main font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-bg-app rounded-2xl border border-border-card text-text-muted">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-main">Tidak Ada Pengajuan</h3>
              <p className="text-xs text-text-muted mt-1">Saat ini tidak ada tiket dari departemen Anda yang memerlukan persetujuan.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
