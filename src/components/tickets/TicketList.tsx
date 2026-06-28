import { useState, useEffect } from 'react'
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
  status: 'pending_approval' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, urgencyFilter])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'open':
        return 'bg-sky-50 text-sky-700 border border-sky-200'
      case 'in_progress':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200'
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <HelpCircle className="h-4 w-4 text-amber-600 animate-pulse" />
      case 'open':
        return <HelpCircle className="h-4 w-4 text-sky-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-indigo-600" />
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-rose-500" />
      default:
        return <XCircle className="h-4 w-4 text-slate-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Menunggu Approval'
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'closed': return 'Closed'
      case 'cancelled': return 'Cancelled'
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

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)

  return (
    <div className="space-y-5">
      {/* Filters Card */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan judul, deskripsi, atau nomor tiket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex-1 sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending_approval">Menunggu Approval</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex-1 sm:w-44">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition cursor-pointer"
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {filteredTickets.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
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
                <tbody className="divide-y divide-slate-100">
                  {currentTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition duration-150">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500 text-xs">
                        {ticket.ticket_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 max-w-[200px] truncate">{ticket.title}</div>
                        <div className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${getUrgencyBadge(ticket.urgency)}`}>
                          {ticket.urgency.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium flex items-center gap-1.5 mt-4">
                        <Folder className="h-3.5 w-3.5 text-slate-400" />
                        {ticket.category}
                      </td>
                      {role !== 'end_user' && (
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {ticket.creator?.full_name || 'User'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                              <User className="h-3 w-3" />
                            </div>
                            <span>{ticket.assignee.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ditugaskan</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/tickets/${ticket.id}`}
                          className="px-4 py-2 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {currentTickets.map((ticket) => (
                <div key={ticket.id} className="p-5 space-y-3.5 hover:bg-slate-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{ticket.ticket_number}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${getUrgencyBadge(ticket.urgency)}`}>
                      {ticket.urgency.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">{ticket.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium">{ticket.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between text-xs pt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {getStatusLabel(ticket.status)}
                    </span>

                    <span className="text-slate-400 font-medium text-[10px]">
                      Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div className="text-[11px] text-slate-500 font-medium flex flex-col gap-1">
                      <span><strong className="text-slate-700">Kategori:</strong> {ticket.category}</span>
                      {role !== 'end_user' && <span><strong className="text-slate-700">Pelapor:</strong> {ticket.creator?.full_name}</span>}
                      <span><strong className="text-slate-700">Ditangani:</strong> {ticket.assignee?.full_name || 'Belum ditugaskan'}</span>
                    </div>

                    <Link 
                      href={`/tickets/${ticket.id}`}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 text-xs font-bold rounded-xl transition text-center"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4.5 bg-slate-50 border-t border-slate-150 text-xs">
                <div className="text-slate-500 font-semibold">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredTickets.length)} dari {filteredTickets.length} tiket
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tidak Ada Tiket Ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Coba sesuaikan kata kunci pencarian atau filter status dan urgensi Anda.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
