'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Folder,
  Calendar,
  AlertCircle
} from 'lucide-react'

interface Ticket {
  id: string
  ticket_number: string
  title: string
  description: string
  category: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  creator: { full_name: string; email: string } | null
  assignee: { full_name: string; email: string } | null
}

interface TicketListProps {
  initialTickets: any[]
  role: string
}

export default function TicketList({ initialTickets, role }: TicketListProps) {
  const [tickets] = useState<Ticket[]>(initialTickets)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
      case 'in_progress':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <HelpCircle className="h-4 w-4 text-sky-400" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-400" />
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      default:
        return <XCircle className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  // Filter logic
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase()) ||
      ticket.category.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesUrgency = urgencyFilter === 'all' || ticket.urgency === urgencyFilter

    return matchesSearch && matchesStatus && matchesUrgency
  })

  return (
    <div className="space-y-5">
      {/* Filters Card */}
      <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan judul, deskripsi, kategori, atau nomor tiket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex-1 md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex-1 md:w-44">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="all">Semua Urgensi</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List / Table Container */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
        {filteredTickets.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 font-medium">
                    <th className="px-6 py-4">Nomor Tiket</th>
                    <th className="px-6 py-4">Judul Aduan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Urgensi</th>
                    <th className="px-6 py-4">Kategori</th>
                    {role !== 'end_user' && <th className="px-6 py-4">Pelapor</th>}
                    <th className="px-6 py-4">Ditangani</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-900/30 transition duration-150">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500 text-xs">
                        {ticket.ticket_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white max-w-[200px] truncate">{ticket.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getUrgencyBadge(ticket.urgency)}`}>
                          {ticket.urgency.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 flex items-center gap-1.5 mt-4">
                        <Folder className="h-3.5 w-3.5 text-slate-500" />
                        {ticket.category}
                      </td>
                      {role !== 'end_user' && (
                        <td className="px-6 py-4 text-slate-300">
                          {ticket.creator?.full_name || 'User'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-400">
                        {ticket.assignee ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <div className="h-5.5 w-5.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                              <User className="h-3 w-3" />
                            </div>
                            <span>{ticket.assignee.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Belum ditugaskan</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/tickets/${ticket.id}`}
                          className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-900/60">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-5 space-y-3.5 hover:bg-slate-900/20 transition">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-slate-500">{ticket.ticket_number}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getUrgencyBadge(ticket.urgency)}`}>
                      {ticket.urgency.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white truncate">{ticket.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ticket.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between text-xs pt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {getStatusLabel(ticket.status)}
                    </span>

                    <span className="text-slate-500 text-[10px]">
                      Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex justify-between items-center">
                    <div className="text-[10px] text-slate-500 flex flex-col gap-0.5">
                      <span>Kategori: {ticket.category}</span>
                      {role !== 'end_user' && <span>Pelapor: {ticket.creator?.full_name}</span>}
                      <span>Ditangani: {ticket.assignee?.full_name || 'Belum ditugaskan'}</span>
                    </div>

                    <Link 
                      href={`/tickets/${ticket.id}`}
                      className="px-4 py-2 bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Tidak Ada Tiket Ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Coba sesuaikan kata kunci pencarian atau filter status dan urgensi Anda.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
