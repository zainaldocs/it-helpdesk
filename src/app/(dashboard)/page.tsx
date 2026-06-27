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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-transparent border border-slate-900">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Halo, {user?.profile?.full_name}!</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.profile?.role === 'end_user'
              ? 'Laporkan masalah IT Anda dan pantau status penyelesaiannya di sini.'
              : 'Kelola dan selesaikan tiket aduan IT dari seluruh karyawan.'}
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

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Tiket Baru (Open)',
            value: metrics.open,
            icon: HelpCircle,
            color: 'text-sky-400',
            bg: 'bg-sky-500/5 border-sky-500/10'
          },
          {
            title: 'Sedang Diproses',
            value: metrics.in_progress,
            icon: Clock,
            color: 'text-amber-400',
            bg: 'bg-amber-500/5 border-amber-500/10'
          },
          {
            title: 'Selesai (Resolved)',
            value: metrics.resolved,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/5 border-emerald-500/10'
          },
          {
            title: 'Ditutup (Closed)',
            value: metrics.closed,
            icon: XCircle,
            color: 'text-slate-400',
            bg: 'bg-slate-500/5 border-slate-500/10'
          }
        ].map((metric, idx) => {
          const Icon = metric.icon
          return (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border bg-slate-900/20 backdrop-blur-sm flex items-center justify-between ${metric.bg}`}
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{metric.title}</span>
                <div className="text-3xl font-bold text-white tracking-tight">{metric.value}</div>
              </div>
              <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${metric.color}`}>
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
            <h2 className="text-lg font-semibold text-white tracking-tight">Tiket Terbaru</h2>
            <Link 
              href="/tickets" 
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
            >
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl divide-y divide-slate-900/60 overflow-hidden">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <Link 
                  key={ticket.id} 
                  href={`/tickets/${ticket.id}`}
                  className="p-5 flex items-start justify-between hover:bg-slate-900/40 transition duration-200 block"
                >
                  <div className="space-y-1.5 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">{ticket.ticket_number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getUrgencyBadge(ticket.urgency)}`}>
                        {ticket.urgency.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate max-w-[280px] sm:max-w-md">{ticket.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{ticket.description}</p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>Kategori: {ticket.category}</span>
                      <span>•</span>
                      <span>Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2.5">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {ticket.assignee ? `Ditangani: ${ticket.assignee.full_name}` : 'Belum ditugaskan'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
                  <Inbox className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">Belum Ada Tiket</h3>
                  <p className="text-xs text-slate-500 mt-1">Saat ini tidak ada tiket aduan yang terdaftar.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Info Cards */}
        <div className="space-y-6">
          <div className="bg-gradient-to-tr from-slate-900/80 to-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Performa Sistem IT</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tim IT Support berkomitmen untuk merespons tiket dengan tingkat urgensi <strong>Critical</strong> dalam waktu 30 menit, dan tingkat <strong>High</strong> dalam waktu 2 jam.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>Rata-rata Respon:</span>
                <span className="text-slate-300 font-semibold">15 Menit</span>
              </div>
              <div className="flex justify-between">
                <span>Rata-rata Resolusi:</span>
                <span className="text-slate-300 font-semibold">3.2 Jam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
