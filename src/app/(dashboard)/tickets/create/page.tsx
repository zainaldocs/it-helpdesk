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
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Tiket
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 border border-purple-100 text-purple-600 rounded-lg shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            Buat Tiket Aduan Baru
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Jelaskan permasalahan IT Anda dengan detail agar tim Technician dapat segera menanganinya.
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold block">Gagal mengirim aduan:</span>
              <span className="text-xs font-medium">{state.error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Judul Masalah / Aduan
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              placeholder="Contoh: Printer lantai 2 tidak bisa mencetak dokumen"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 shadow-inner"
            />
          </div>

          {/* Grid Category & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Kategori Masalah
              </label>
              <select
                name="category"
                id="category"
                required
                defaultValue=""
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 cursor-pointer shadow-inner font-medium"
              >
                <option value="" disabled>Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor="urgency" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Tingkat Urgensi
              </label>
              <select
                name="urgency"
                id="urgency"
                required
                defaultValue="low"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 cursor-pointer shadow-inner font-medium"
              >
                {urgencies.map((urg) => (
                  <option key={urg.value} value={urg.value}>{urg.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Deskripsi Masalah secara Detail
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows={5}
              placeholder="Deskripsikan secara detail langkah kejadian, error message (jika ada), dan tindakan yang sudah Anda lakukan..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 resize-y shadow-inner"
            />
          </div>

          {/* Attachment URL */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Lampiran Pendukung (Opsional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Paperclip className="h-4.5 w-4.5" />
              </span>
              <input
                type="url"
                name="attachmentUrl"
                placeholder="https://imgur.com/screenshot.jpg (URL Gambar / File lampiran)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 shadow-inner"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-medium">
              Masukkan tautan/URL tangkapan layar (screenshot) atau berkas pendukung Anda.
            </p>
          </div>

          {/* Submit and Cancel Button */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 mt-2 justify-end border-t border-slate-100">
            <Link
              href="/tickets"
              className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 rounded-xl text-sm font-bold transition text-center shadow-sm"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/20 hover:shadow-purple-500/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim...
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
