'use client'

import { useState } from 'react'
import { 
  updateTicketStatus, 
  assignTicket 
} from '@/app/actions/tickets'
import { createNote } from '@/app/actions/notes'
import { 
  User, 
  Clock, 
  AlertTriangle, 
  Tag, 
  Calendar, 
  FileCheck,
  Send,
  Loader2,
  Lock,
  UserCheck,
  ExternalLink,
  MessageSquare,
  Laptop,
  Check
} from 'lucide-react'

interface Note {
  id: string
  content: string
  is_internal: boolean
  created_at: string
  user: {
    full_name: string
    email: string
    role: string
  }
}

interface TicketDetailProps {
  ticket: any
  currentUser: any
  initialNotes: any[]
  technicians: any[]
}

export default function TicketDetail({ 
  ticket, 
  currentUser, 
  initialNotes, 
  technicians 
}: TicketDetailProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [noteContent, setNoteContent] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false)

  const [ticketStatus, setTicketStatus] = useState(ticket.status)
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)

  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || '')
  const [isAssigning, setIsAssigning] = useState(false)

  const isStaff = currentUser?.profile?.role === 'admin' || currentUser?.profile?.role === 'technician'

  const handleStatusChange = async (
    newStatus: 'pending_approval' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
  ) => {
    setIsStatusUpdating(true)
    const res = await updateTicketStatus(ticket.id, newStatus)
    setIsStatusUpdating(false)

    if (res.success) {
      setTicketStatus(newStatus)
    } else {
      alert(res.error || 'Gagal memperbarui status.')
    }
  }

  const handleAssignChange = async (technicianId: string) => {
    setIsAssigning(true)
    const val = technicianId === '' ? null : technicianId
    const res = await assignTicket(ticket.id, val)
    setIsAssigning(false)

    if (res.success) {
      setAssignedTo(technicianId)
    } else {
      alert(res.error || 'Gagal menugaskan tiket.')
    }
  }

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return

    setIsNoteSubmitting(true)
    const res = await createNote(ticket.id, noteContent, isInternalNote)
    setIsNoteSubmitting(false)

    if (res.success) {
      // Append note locally
      const newNote: Note = {
        id: Math.random().toString(),
        content: noteContent,
        is_internal: isInternalNote,
        created_at: new Date().toISOString(),
        user: {
          full_name: currentUser.profile.full_name,
          email: currentUser.email,
          role: currentUser.profile.role
        }
      }
      setNotes([...notes, newNote])
      setNoteContent('')
      setIsInternalNote(false)
    } else {
      alert(res.error || 'Gagal menambahkan catatan.')
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
        <div className="p-4.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-sm">
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
      <div className="w-full py-5 px-4 md:px-8 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-200 z-0" />
          <div 
            className="absolute left-4 top-4 h-0.5 bg-purple-600 z-0 transition-all duration-500" 
            style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 95}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx
            const isActive = idx === currentIdx
            const isUpcoming = idx > currentIdx

            return (
              <div key={step.key} className="flex flex-col items-center z-10 relative">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold transition duration-300 ${
                  isActive 
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20 ring-4 ring-purple-100'
                    : isCompleted
                    ? 'bg-purple-50 border-purple-200 text-purple-600'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <span className={`text-[10px] mt-2 font-bold whitespace-nowrap hidden sm:block ${
                  isActive ? 'text-purple-700 font-extrabold' : isCompleted ? 'text-slate-700 font-semibold' : 'text-slate-400 font-medium'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
        {/* Mobile view labels */}
        <div className="text-center text-xs font-bold text-purple-700 mt-4 sm:hidden uppercase tracking-wider">
          Tahap Aktif: {steps[currentIdx]?.label || ticketStatus}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Detail Tiket Utama (Kiri/Tengah) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-8 space-y-6 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{ticket.ticket_number}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getUrgencyBadge(ticket.urgency)}`}>
                  {ticket.urgency.toUpperCase()}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusBadge(ticketStatus)}`}>
                  {getStatusLabel(ticketStatus)}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {ticket.title}
              </h1>
            </div>
          </div>

          {/* Timeline Stepper */}
          {getStepper()}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500 shadow-sm">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Kategori</span>
                <span className="font-bold text-slate-900">{ticket.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500 shadow-sm">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Tanggal Dibuat</span>
                <span className="font-bold text-slate-900">
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
              <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500 shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Pelapor</span>
                <span className="font-bold text-slate-900 truncate block max-w-[150px]" title={ticket.creator?.email}>
                  {ticket.creator?.full_name}
                </span>
              </div>
            </div>

            {ticket.asset && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500 shadow-sm">
                  <Laptop className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Aset Bermasalah</span>
                  <span className="font-bold text-purple-700 font-mono" title={ticket.asset.name}>
                    {ticket.asset.asset_code}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Masalah</h3>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {ticket.description}
            </div>
          </div>

          {/* Attachment */}
          {ticket.attachment_url && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lampiran Pendukung</h3>
              <a 
                href={ticket.attachment_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 hover:border-purple-200 transition shadow-sm w-full sm:w-auto justify-center"
              >
                <span>Lihat Lampiran</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Notes/Discussions Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-purple-500" />
              Catatan & Diskusi ({notes.length})
            </h3>
          </div>

          {/* Notes list */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {notes.length > 0 ? (
              notes.map((note) => {
                const isInternal = note.is_internal
                const isNoteUserStaff = note.user?.role === 'admin' || note.user?.role === 'technician'
                return (
                  <div 
                    key={note.id} 
                    className={`p-4.5 rounded-xl border text-sm transition shadow-sm ${
                      isInternal 
                        ? 'bg-amber-50 border-amber-200 text-amber-900' 
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                          {note.user?.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{note.user?.full_name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({note.user?.role === 'admin' ? 'Admin' : note.user?.role === 'technician' ? 'IT Support' : 'Karyawan'})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium ml-8 sm:ml-0">
                        {isInternal && (
                          <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
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
              <div className="p-8 text-center text-slate-500 text-xs font-medium italic bg-slate-50 rounded-xl border border-slate-100">
                Belum ada catatan atau tanggapan untuk tiket ini.
              </div>
            )}
          </div>

          {/* Note Form */}
          <form onSubmit={handleNoteSubmit} className="space-y-4 pt-5 border-t border-slate-100">
            <div>
              <label htmlFor="noteContent" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Tambahkan Tanggapan / Catatan
              </label>
              <textarea
                id="noteContent"
                rows={3}
                required
                placeholder="Ketik tanggapan Anda di sini..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 resize-none shadow-inner"
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
                    className="h-4.5 w-4.5 bg-white border border-slate-300 rounded accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/20 w-full sm:w-auto"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileCheck className="h-4.5 w-4.5 text-purple-500" />
              Kontrol Teknisi & Admin
            </h3>

            {/* Change Status */}
            <div className="space-y-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Perbarui Status Tiket</span>
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
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign Ticket */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label htmlFor="assign" className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                Tugaskan Teknisi (Assignee)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <UserCheck className="h-4 w-4" />
                </span>
                <select
                  id="assign"
                  value={assignedTo}
                  disabled={isAssigning}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition cursor-pointer shadow-inner"
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
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-blue-800 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-blue-500" />
              Catatan Bantuan
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Anda sebagai pelapor (karyawan) hanya dapat melihat tanggapan publik. Status tiket akan diperbarui oleh tim IT Support setelah permasalahan Anda ditangani.
            </p>
          </div>
        )}

        {/* Current Assigned Staff Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-100 pb-2">Detail Petugas IT</span>
          {ticket.assignee ? (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="h-9 w-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600">
                <User className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">{ticket.assignee.full_name}</span>
                <span className="text-[10px] font-medium text-slate-500">{ticket.assignee.email}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 text-center rounded-xl border border-slate-100 text-slate-500 font-medium italic">
              Tiket aduan belum ditugaskan ke petugas IT manapun.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
