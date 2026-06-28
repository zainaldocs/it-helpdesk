'use client'

import { useState, useTransition } from 'react'
import { 
  Check, 
  MessageSquare, 
  Send, 
  Loader2, 
  Clock, 
  AlertTriangle,
  Folder,
  Calendar,
  User,
  Paperclip,
  ExternalLink,
  Lock,
  UserCheck,
  Tag,
  Laptop,
  FileCheck
} from 'lucide-react'
import { updateTicketStatus, assignTicket, addTicketNote } from '@/app/actions/tickets'

interface Note {
  id: string
  content: string
  created_at: string
  is_internal: boolean
  user: {
    full_name: string
    role: string
    email: string
  } | null
}

interface TicketDetailProps {
  initialTicket: any
  initialNotes: Note[]
  currentUser: {
    id: string
    role: string
    email: string
  }
  technicians: { id: string; full_name: string; role: string }[]
}

export default function TicketDetail({ 
  initialTicket, 
  initialNotes, 
  currentUser,
  technicians
}: TicketDetailProps) {
  const [ticket, setTicket] = useState(initialTicket)
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  
  // Note Form State
  const [noteContent, setNoteContent] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false)

  // Status & Assign Actions State
  const [isStatusUpdating, startStatusTransition] = useTransition()
  const [isAssigning, startAssignTransition] = useTransition()
  
  const ticketStatus = ticket.status
  const isStaff = currentUser.role === 'admin' || currentUser.role === 'technician'
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || '')

  const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled') => {
    if (!confirm(`Ubah status tiket menjadi "${newStatus}"?`)) return
    
    startStatusTransition(async () => {
      const result = await updateTicketStatus(ticket.id, newStatus)
      if (result.error) {
        alert('Gagal memperbarui status: ' + result.error)
      } else {
        setTicket(prev => ({ ...prev, status: newStatus }))
        // Refresh notes list because status update may append system log notes
        if (result.notes) {
          setNotes(result.notes as any[])
        }
      }
    })
  }

  const handleAssignChange = async (techId: string) => {
    startAssignTransition(async () => {
      const result = await assignTicket(ticket.id, techId || null)
      if (result.error) {
        alert('Gagal menugaskan tiket: ' + result.error)
      } else {
        setAssignedTo(techId)
        setTicket(prev => ({ ...prev, assigned_to: techId || null }))
        // Refresh notes
        if (result.notes) {
          setNotes(result.notes as any[])
        }
      }
    })
  }

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim() || isNoteSubmitting) return

    setIsNoteSubmitting(true)
    const result = await addTicketNote(ticket.id, noteContent.trim(), isInternalNote)
    setIsNoteSubmitting(false)

    if (result.error) {
      alert('Gagal menambah catatan: ' + result.error)
    } else {
      setNoteContent('')
      setIsInternalNote(false)
      if (result.notes) {
        setNotes(result.notes as any[])
      }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
      case 'open':
        return 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
      case 'in_progress':
        return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
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

  const steps = [
    { key: 'pending_approval', label: 'Approval Manager' },
    { key: 'open', label: 'Buka (IT)' },
    { key: 'in_progress', label: 'Diproses' },
    { key: 'resolved', label: 'Selesai' },
    { key: 'closed', label: 'Ditutup' }
  ]

  const getStepper = () => {
    if (ticketStatus === 'cancelled') {
      return (
        <div className="p-4.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <div>
            <strong className="block font-bold">Tiket Dibatalkan / Ditolak</strong>
            <span className="opacity-90 font-medium">Pengajuan tiket aduan ini telah dibatalkan atau ditolak oleh Manager Departemen.</span>
          </div>
        </div>
      )
    }

    const currentIdx = steps.findIndex(s => s.key === ticketStatus)

    return (
      <div className="w-full py-5 px-4 md:px-8 bg-bg-app border border-border-card rounded-xl transition duration-200">
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-200/20 z-0" />
          <div 
            className="absolute left-4 top-4 h-0.5 bg-brand-primary z-0 transition-all duration-500" 
            style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 95}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx
            const isActive = idx === currentIdx

            return (
              <div key={step.key} className="flex flex-col items-center z-10 relative">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold transition duration-300 ${
                  isActive 
                    ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20 ring-4 ring-brand-primary/10'
                    : isCompleted
                    ? 'bg-brand-light border border-brand-primary/20 text-brand-text'
                    : 'bg-bg-card border-border-card text-text-muted'
                }`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <span className={`text-[10px] mt-2 font-bold whitespace-nowrap hidden sm:block ${
                  isActive ? 'text-brand-text font-extrabold' : isCompleted ? 'text-text-main font-semibold' : 'text-text-muted font-medium'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
        {/* Mobile view labels */}
        <div className="text-center text-xs font-bold text-brand-text mt-4 sm:hidden uppercase tracking-wider">
          Tahap Aktif: {steps[currentIdx]?.label || ticketStatus}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Detail Tiket Utama (Kiri/Tengah) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-bg-card border border-border-card rounded-2xl p-5 md:p-8 space-y-6 shadow-sm transition duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-border-card">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-text-muted">{ticket.ticket_number}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${getUrgencyBadge(ticket.urgency)}`}>
                  {ticket.urgency}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-text-main leading-tight">{ticket.title}</h1>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
              <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${getStatusBadge(ticketStatus)}`}>
                {getStatusLabel(ticketStatus)}
              </span>
            </div>
          </div>

          {/* Timeline Stepper */}
          {getStepper()}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-bg-app border border-border-card text-xs shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-bg-card rounded-lg border border-border-card text-text-muted shadow-sm">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <span className="text-text-muted font-medium block">Kategori</span>
                <span className="font-bold text-text-main">{ticket.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-bg-card rounded-lg border border-border-card text-text-muted shadow-sm">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <span className="text-text-muted font-medium block">Tanggal Dibuat</span>
                <span className="font-bold text-text-main">
                  {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-bg-card rounded-lg border border-border-card text-text-muted shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div>
                <span className="text-text-muted font-medium block">Pelapor</span>
                <span className="font-bold text-text-main truncate block max-w-[150px]" title={ticket.creator?.email}>
                  {ticket.creator?.full_name}
                </span>
              </div>
            </div>

            {ticket.asset && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bg-card rounded-lg border border-border-card text-text-muted shadow-sm">
                  <Laptop className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-text-muted font-medium block">Aset Bermasalah</span>
                  <span className="font-bold text-brand-text font-mono" title={ticket.asset.name}>
                    {ticket.asset.asset_code}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Deskripsi Masalah</h3>
            <div className="p-5 rounded-xl bg-bg-app border border-border-card text-text-main text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {ticket.description}
            </div>
          </div>

          {/* Asset Specifications */}
          {ticket.asset?.specifications && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Spesifikasi Perangkat</h3>
              <div className="p-5 rounded-xl bg-bg-app border border-border-card text-text-main text-xs font-semibold leading-relaxed whitespace-pre-wrap font-mono shadow-inner">
                {ticket.asset.specifications}
              </div>
            </div>
          )}

          {/* Attachment */}
          {ticket.attachment_url && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Lampiran Pendukung</h3>
              <a 
                href={ticket.attachment_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 p-3 bg-bg-card border border-border-card rounded-xl text-xs font-bold text-brand-primary hover:text-brand-hover hover:bg-brand-light hover:border-brand-primary/20 transition shadow-sm w-full sm:w-auto justify-center"
              >
                <span>Lihat Lampiran</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Notes/Discussions Section */}
        <div className="bg-bg-card border border-border-card rounded-2xl p-5 md:p-8 space-y-6 shadow-sm transition duration-200">
          <div className="flex items-center justify-between border-b border-border-card pb-4">
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-brand-primary" />
              Catatan & Diskusi ({notes.length})
            </h3>
          </div>

          {/* Notes list */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {notes.length > 0 ? (
              notes.map((note) => {
                const isInternal = note.is_internal
                return (
                  <div 
                    key={note.id} 
                    className={`p-4.5 rounded-xl border text-sm transition shadow-sm ${
                      isInternal 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                        : 'bg-bg-card border-border-card text-text-main'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="h-6 w-6 rounded-full bg-bg-app flex items-center justify-center text-[10px] font-bold text-text-muted border border-border-card">
                          {note.user?.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-text-main">{note.user?.full_name}</span>
                        <span className="text-[10px] text-text-muted font-medium">({note.user?.role === 'admin' ? 'Admin' : note.user?.role === 'technician' ? 'IT Support' : 'Karyawan'})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium ml-8 sm:ml-0">
                        {isInternal && (
                          <span className="bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            Internal Notes
                          </span>
                        )}
                        <span>
                          {new Date(note.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="leading-relaxed text-xs md:text-sm whitespace-pre-wrap ml-8 sm:ml-0 font-medium">{note.content}</p>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-text-muted text-xs font-medium italic bg-bg-app rounded-xl border border-border-card">
                Belum ada catatan atau tanggapan untuk tiket ini.
              </div>
            )}
          </div>

          {/* Note Form */}
          <form onSubmit={handleNoteSubmit} className="space-y-4 pt-5 border-t border-border-card">
            <div>
              <label htmlFor="noteContent" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Tambahkan Tanggapan / Catatan
              </label>
              <textarea
                id="noteContent"
                rows={3}
                required
                placeholder="Ketik tanggapan Anda di sini..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-4 py-3 bg-bg-app border border-border-card rounded-xl text-sm text-text-main placeholder-text-muted/50 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition duration-200 resize-none shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Internal Note Checkbox (Staff Only) */}
              {isStaff ? (
                <label className="flex items-center gap-2.5 text-xs text-amber-600 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="h-4.5 w-4.5 bg-bg-card border border-border-card rounded accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <Lock className="h-3.5 w-3.5" />
                  Jadikan sebagai Catatan Internal (Tim IT)
                </label>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={isNoteSubmitting}
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/20 w-full sm:w-auto"
              >
                {isNoteSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Kirim Catatan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Control Panel / Actions Sidebar (Kanan) */}
      <div className="space-y-6">
        {/* Action Panel for Staff */}
        {isStaff ? (
          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-5 shadow-sm transition duration-200">
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border-card">
              <FileCheck className="h-4.5 w-4.5 text-brand-primary" />
              Kontrol Teknisi & Admin
            </h3>

            {/* Change Status */}
            <div className="space-y-3">
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">Perbarui Status Tiket</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ].map((st) => (
                  <button
                    key={st.value}
                    onClick={() => handleStatusChange(st.value as any)}
                    disabled={isStatusUpdating}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      ticketStatus === st.value
                        ? getStatusBadge(st.value) + ' shadow-sm'
                        : 'border-border-card bg-bg-app text-text-muted hover:text-text-main hover:bg-bg-card'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign Ticket */}
            <div className="space-y-2 pt-4 border-t border-border-card">
              <label htmlFor="assign" className="text-xs text-text-muted font-bold uppercase tracking-wider block">
                Tugaskan Teknisi (Assignee)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                  <UserCheck className="h-4 w-4" />
                </span>
                <select
                  id="assign"
                  value={assignedTo}
                  disabled={isAssigning}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-bg-app border border-border-card rounded-xl text-xs font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition cursor-pointer shadow-inner"
                >
                  <option value="">-- Belum Ditugaskan --</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.full_name} ({tech.role === 'admin' ? 'Admin' : 'Tech'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-blue-500" />
              Catatan Bantuan
            </h3>
            <p className="text-xs text-blue-400 leading-relaxed font-medium">
              Anda sebagai pelapor (karyawan) hanya dapat melihat tanggapan publik. Status tiket akan diperbarui oleh tim IT Support setelah permasalahan Anda ditangani.
            </p>
          </div>
        )}

        {/* Current Assigned Staff Summary */}
        <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-4 shadow-sm text-xs transition duration-200">
          <span className="text-xs text-text-muted font-bold uppercase tracking-wider block border-b border-border-card pb-2">Detail Petugas IT</span>
          {ticket.assignee ? (
            <div className="flex items-center gap-3 bg-bg-app p-3 rounded-xl border border-border-card shadow-sm">
              <div className="h-9 w-9 rounded-full bg-brand-light border border-brand-primary/10 flex items-center justify-center text-brand-text">
                <User className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-bold text-text-main block">{ticket.assignee.full_name}</span>
                <span className="text-[10px] font-medium text-text-muted">{ticket.assignee.email}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-bg-app text-center rounded-xl border border-border-card text-text-muted font-medium italic">
              Tiket aduan belum ditugaskan ke petugas IT manapun.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
