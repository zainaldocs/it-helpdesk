'use client'

import { useActionState, startTransition, useState } from 'react'
import { createTicket, type CreateTicketState } from '@/app/actions/tickets'
import Link from 'next/link'
import { 
  Terminal, 
  Loader2, 
  ArrowLeft, 
  FileText, 
  HelpCircle,
  AlertCircle,
  Paperclip
} from 'lucide-react'

const initialState: CreateTicketState = {}

export default function CreateTicketPage() {
  const [state, formAction, isPending] = useActionState(createTicket, initialState)
  const [attachmentUrl, setAttachmentUrl] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => {
      formAction(formData)
    })
  }

  // Categories
  const categories = [
    { value: 'Software', label: 'Aplikasi / Software (OS, Office, dsb)' },
    { value: 'Hardware', label: 'Perangkat Keras / Hardware (PC, Laptop, Printer)' },
    { value: 'Network', label: 'Jaringan & Internet (Wi-Fi, LAN, VPN)' },
    { value: 'Account/Access', label: 'Akun & Akses (Email, Active Directory, ERP)' },
    { value: 'Other', label: 'Lainnya / Pertanyaan Umum' },
  ]

  // Urgencies
  const urgencies = [
    { value: 'low', label: 'Rendah (Low)', desc: 'Tidak mengganggu pekerjaan operasional harian.' },
    { value: 'medium', label: 'Sedang (Medium)', desc: 'Mengganggu sebagian kecil alur kerja, ada solusi sementara.' },
    { value: 'high', label: 'Tinggi (High)', desc: 'Mengganggu alur kerja utama, membutuhkan perhatian cepat.' },
    { value: 'critical', label: 'Kritis (Critical)', desc: 'Seluruh sistem down, operasional bisnis terhenti total.' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href="/tickets" 
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Tiket
      </Link>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            Buat Tiket Aduan Baru
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Jelaskan permasalahan IT Anda dengan detail agar tim Technician dapat segera menanganinya.
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-sm text-red-400 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <span className="font-semibold block">Gagal mengirim aduan:</span>
              <span className="text-xs text-red-400/80">{state.error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Judul Masalah / Aduan
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              placeholder="Contoh: Printer lantai 2 tidak bisa mencetak dokumen"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
            />
          </div>

          {/* Grid Category & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Kategori Masalah
              </label>
              <select
                name="category"
                id="category"
                required
                defaultValue=""
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 cursor-pointer"
              >
                <option value="" disabled>Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor="urgency" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tingkat Urgensi
              </label>
              <select
                name="urgency"
                id="urgency"
                required
                defaultValue="low"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 cursor-pointer"
              >
                {urgencies.map((urg) => (
                  <option key={urg.value} value={urg.value}>{urg.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Deskripsi Masalah secara Detail
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows={5}
              placeholder="Deskripsikan secara detail langkah kejadian, error message (jika ada), dan tindakan yang sudah Anda lakukan..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 resize-y"
            />
          </div>

          {/* Attachment URL (Placeholder for demonstration) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Lampiran Pendukung (Opsional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Paperclip className="h-4.5 w-4.5" />
              </span>
              <input
                type="url"
                name="attachmentUrl"
                placeholder="https://imgur.com/screenshot.jpg (URL Gambar / File lampiran)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
              Masukkan tautan/URL tangkapan layar (screenshot) atau berkas pendukung Anda.
            </p>
          </div>

          {/* Submit and Cancel Button */}
          <div className="flex gap-4 pt-2 justify-end border-t border-slate-800/60">
            <Link
              href="/tickets"
              className="px-5 py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim Aduan...
                </>
              ) : (
                'Kirim Aduan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
