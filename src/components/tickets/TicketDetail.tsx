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
  MessageSquare
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

  const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
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
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Detail Tiket Utama (Kiri/Tengah) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-slate-900/60">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-500">{ticket.ticket_number}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getUrgencyBadge(ticket.urgency)}`}>
                  {ticket.urgency.toUpperCase()}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusBadge(ticketStatus)}`}>
                  {getStatusLabel(ticketStatus)}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                {ticket.title}
              </h1>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 p-4 rounded-xl bg-slate-950/40 border border-slate-900 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-500 block">Kategori</span>
                <span className="font-semibold text-slate-200">{ticket.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-500 block">Tanggal Dibuat</span>
                <span className="font-semibold text-slate-200">
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
              <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-500 block">Pelapor (End-User)</span>
                <span className="font-semibold text-slate-200 truncate block max-w-[150px]" title={ticket.creator?.email}>
                  {ticket.creator?.full_name}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deskripsi Masalah</h3>
            <div className="p-5 rounded-xl bg-slate-950/20 border border-slate-900 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Attachment */}
          {ticket.attachment_url && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lampiran Pendukung</h3>
              <a 
                href={ticket.attachment_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-semibold text-blue-400 hover:text-blue-300 hover:border-slate-700 transition"
              >
                <span>Lihat Lampiran</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Notes/Discussions Section */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              Catatan & Diskusi ({notes.length})
            </h3>
          </div>

          {/* Notes list */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {notes.length > 0 ? (
              notes.map((note) => {
                const isInternal = note.is_internal
                const isNoteUserStaff = note.user?.role === 'admin' || note.user?.role === 'technician'
                return (
                  <div 
                    key={note.id} 
                    className={`p-4.5 rounded-xl border text-sm transition ${
                      isInternal 
                        ? 'bg-amber-950/15 border-amber-900/30 text-amber-300' 
                        : 'bg-slate-950/40 border-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-200">{note.user?.full_name}</span>
                        <span className="text-[10px] text-slate-500">({note.user?.role === 'admin' ? 'Admin' : note.user?.role === 'technician' ? 'IT Support' : 'Karyawan'})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        {isInternal && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
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
                    <p className="leading-relaxed text-xs md:text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                Belum ada catatan atau tanggapan untuk tiket ini.
              </div>
            )}
          </div>

          {/* Note Form */}
          <form onSubmit={handleNoteSubmit} className="space-y-4 pt-4 border-t border-slate-900/60">
            <div>
              <label htmlFor="noteContent" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tambahkan Tanggapan / Catatan
              </label>
              <textarea
                id="noteContent"
                rows={3}
                required
                placeholder="Ketik tanggapan Anda di sini..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Internal Note Checkbox (Staff Only) */}
              {isStaff ? (
                <label className="flex items-center gap-2.5 text-xs text-amber-400 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="h-4 w-4 bg-slate-950 border border-slate-800 rounded accent-amber-500 focus:outline-none focus:ring-0"
                  />
                  <Lock className="h-3.5 w-3.5" />
                  Jadikan sebagai Catatan Internal (Hanya dilihat Tim IT)
                </label>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={isNoteSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isNoteSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
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
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="h-4.5 w-4.5 text-blue-400" />
              Kontrol Teknisi & Admin
            </h3>

            {/* Change Status */}
            <div className="space-y-2.5">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Perbarui Status Tiket</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' }
                ].map((st) => (
                  <button
                    key={st.value}
                    onClick={() => handleStatusChange(st.value as any)}
                    disabled={isStatusUpdating}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex-1 text-center ${
                      ticketStatus === st.value
                        ? getStatusBadge(st.value)
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign Ticket */}
            <div className="space-y-2 pt-2 border-t border-slate-900/60">
              <label htmlFor="assign" className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                Tugaskan Teknisi (Assignee)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <UserCheck className="h-4 w-4" />
                </span>
                <select
                  id="assign"
                  value={assignedTo}
                  disabled={isAssigning}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition cursor-pointer"
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
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-blue-400" />
              Catatan Bantuan
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anda sebagai pelapor (karyawan) hanya dapat melihat tanggapan publik. Status tiket akan diperbarui oleh tim IT Support setelah permasalahan Anda ditangani.
            </p>
          </div>
        )}

        {/* Current Assigned Staff Summary */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-3.5 shadow-xl text-xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Detail Petugas IT</span>
          {ticket.assignee ? (
            <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <User className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-200 block">{ticket.assignee.full_name}</span>
                <span className="text-[10px] text-slate-500">{ticket.assignee.email}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-950/40 text-center rounded-xl border border-slate-900 text-slate-500 italic">
              Tiket aduan belum ditugaskan ke petugas IT manapun.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
