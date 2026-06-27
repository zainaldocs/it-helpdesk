import { getTicketMetrics, getTickets } from '@/app/actions/tickets'
import { getCurrentUser } from '@/app/actions/auth'
import Link from 'next/link'
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const metrics = await getTicketMetrics()
  const recentTickets = (await getTickets()).slice(0, 5) // Get latest 5 tickets

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
      case 'open':
        return 'bg-sky-50 text-sky-700 border border-sky-200'
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Buka (Open)'
      case 'in_progress': return 'Diproses (In Progress)'
      case 'resolved': return 'Selesai (Resolved)'
      case 'closed': return 'Ditutup (Closed)'
      default: return status
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Halo, {user?.profile?.full_name}!</h1>
          <p className="text-purple-100 text-sm mt-1.5 font-medium">
            {user?.profile?.role === 'end_user'
              ? 'Laporkan masalah IT Anda dan pantau status penyelesaiannya di sini.'
              : 'Kelola dan selesaikan tiket aduan IT dari seluruh karyawan.'}
          </p>
        </div>
        {user?.profile?.role === 'end_user' && (
          <Link
            href="/tickets/create"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-700 hover:bg-slate-50 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer w-full md:w-auto"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Buat Tiket Baru
          </Link>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Tiket Baru (Open)',
            value: metrics.open,
            icon: HelpCircle,
            color: 'text-sky-600',
            bg: 'bg-sky-50 border-sky-100'
          },
          {
            title: 'Sedang Diproses',
            value: metrics.in_progress,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-100'
          },
          {
            title: 'Selesai (Resolved)',
            value: metrics.resolved,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-100'
          },
          {
            title: 'Ditutup (Closed)',
            value: metrics.closed,
            icon: XCircle,
            color: 'text-slate-500',
            bg: 'bg-slate-50 border-slate-200'
          }
        ].map((metric, idx) => {
          const Icon = metric.icon
          return (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border bg-white shadow-sm flex items-center justify-between`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.title}</span>
                <div className="text-3xl font-black text-slate-900 tracking-tight">{metric.value}</div>
              </div>
              <div className={`p-3.5 rounded-xl border ${metric.bg} ${metric.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tiket Terbaru</h2>
            <Link 
              href="/tickets" 
              className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 transition"
            >
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <Link 
                  key={ticket.id} 
                  href={`/tickets/${ticket.id}`}
                  className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50 transition duration-200 block"
                >
                  <div className="space-y-2 pr-4 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">{ticket.ticket_number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getUrgencyBadge(ticket.urgency)}`}>
                        {ticket.urgency.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-full sm:max-w-md">{ticket.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p>
                    <div className="text-[10px] font-medium text-slate-400 flex items-center gap-2">
                      <span>Kategori: {ticket.category}</span>
                      <span>•</span>
                      <span>Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100 sm:border-0 justify-between sm:justify-start">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">
                      {ticket.assignee ? `Ditangani: ${ticket.assignee.full_name}` : 'Belum ditugaskan'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                  <Inbox className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Belum Ada Tiket</h3>
                  <p className="text-xs text-slate-500 mt-1">Saat ini tidak ada tiket aduan yang terdaftar.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Info Cards */}
        <div className="space-y-6">
          <div className="bg-gradient-to-tr from-slate-50 to-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">Performa Sistem IT</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Tim IT Support berkomitmen untuk merespons tiket dengan tingkat urgensi <strong className="text-slate-900">Critical</strong> dalam waktu 30 menit, dan tingkat <strong className="text-slate-900">High</strong> dalam waktu 2 jam.
            </p>
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold uppercase tracking-wider">Rata-rata Respon:</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">15 Menit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold uppercase tracking-wider">Rata-rata Resolusi:</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">3.2 Jam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
