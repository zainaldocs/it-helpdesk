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
        return 'bg-red-500/10 text-red-500 border border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
      default:
        return 'bg-brand-light text-brand-text border border-brand-primary/20'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
      case 'in_progress':
        return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Menunggu Approval'
      case 'open': return 'Buka (Open)'
      case 'in_progress': return 'Diproses (In Progress)'
      case 'resolved': return 'Selesai (Resolved)'
      case 'closed': return 'Ditutup (Closed)'
      case 'cancelled': return 'Dibatalkan (Cancelled)'
      default: return status
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-hover shadow-lg shadow-brand-primary/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Halo, {user?.profile?.full_name}!</h1>
          <p className="text-white/80 text-sm mt-1.5 font-medium">
            {user?.profile?.role === 'end_user'
              ? 'Laporkan masalah IT Anda dan pantau status penyelesaiannya di sini.'
              : 'Kelola dan selesaikan tiket aduan IT dari seluruh karyawan.'}
          </p>
        </div>
        {user?.profile?.role === 'end_user' && (
          <Link
            href="/tickets/create"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-brand-text hover:bg-slate-50 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer w-full md:w-auto"
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
            color: 'text-sky-500',
            bg: 'bg-sky-500/10 border-sky-500/20'
          },
          {
            title: 'Sedang Diproses',
            value: metrics.in_progress,
            icon: Clock,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10 border-indigo-500/20'
          },
          {
            title: 'Selesai (Resolved)',
            value: metrics.resolved,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10 border-emerald-500/20'
          },
          {
            title: 'Ditutup (Closed)',
            value: metrics.closed,
            icon: XCircle,
            color: 'text-slate-400',
            bg: 'bg-slate-500/10 border-slate-500/20'
          }
        ].map((metric, idx) => {
          const Icon = metric.icon
          return (
            <div 
              key={idx} 
              className="p-6 rounded-2xl border bg-bg-card border-border-card shadow-sm flex items-center justify-between transition duration-200"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{metric.title}</span>
                <div className="text-3xl font-black text-text-main tracking-tight">{metric.value}</div>
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
            <h2 className="text-lg font-bold text-text-main tracking-tight">Tiket Terbaru</h2>
            <Link 
              href="/tickets" 
              className="text-xs text-brand-primary hover:text-brand-hover font-bold flex items-center gap-1 transition"
            >
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-bg-card border border-border-card rounded-2xl divide-y divide-border-card shadow-sm overflow-hidden transition duration-200">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <Link 
                  key={ticket.id} 
                  href={`/tickets/${ticket.id}`}
                  className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-bg-app transition duration-200 block"
                >
                  <div className="space-y-2 pr-4 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-text-muted">{ticket.ticket_number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getUrgencyBadge(ticket.urgency)}`}>
                        {ticket.urgency.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-text-main truncate max-w-full sm:max-w-md">{ticket.title}</h3>
                    <p className="text-xs text-text-muted line-clamp-1">{ticket.description}</p>
                    <div className="text-[10px] font-medium text-text-muted flex items-center gap-2">
                      <span>Kategori: {ticket.category}</span>
                      <span>•</span>
                      <span>Dibuat: {new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border-card sm:border-0 justify-between sm:justify-start">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className="text-[10px] font-medium text-text-muted">
                      {ticket.assignee ? `Ditangani: ${ticket.assignee.full_name}` : 'Belum ditugaskan'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="p-3.5 bg-bg-app rounded-2xl border border-border-card text-text-muted">
                  <Inbox className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Belum Ada Tiket</h3>
                  <p className="text-xs text-text-muted mt-1">Saat ini tidak ada tiket aduan yang terdaftar.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Info Cards */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-4 shadow-sm transition duration-200">
            <div className="flex items-center gap-2 text-brand-primary">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">Performa Sistem IT</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed font-medium">
              Tim IT Support berkomitmen untuk merespons tiket dengan tingkat urgensi <strong className="text-text-main">Critical</strong> dalam waktu 30 menit, dan tingkat <strong className="text-text-main">High</strong> dalam waktu 2 jam.
            </p>
            <div className="pt-3 border-t border-border-card text-[10px] text-text-muted flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold uppercase tracking-wider">Rata-rata Respon:</span>
                <span className="text-text-main font-bold bg-bg-app border border-border-card px-2 py-1 rounded">15 Menit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold uppercase tracking-wider">Rata-rata Resolusi:</span>
                <span className="text-text-main font-bold bg-bg-app border border-border-card px-2 py-1 rounded">3.2 Jam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
