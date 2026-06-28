'use client'

import { useState, useActionState, useEffect } from 'react'
import Link from 'next/link'
import { createTicket } from '@/app/actions/tickets'
import { getMyDepartmentAssets } from '@/app/actions/tickets'
import { ArrowLeft, FileText, Loader2, AlertCircle, Paperclip, Laptop } from 'lucide-react'

export default function CreateTicketPage() {
  const [state, formAction, isPending] = useActionState(createTicket, null)
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [assets, setAssets] = useState<any[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)

  useEffect(() => {
    async function loadAssets() {
      try {
        const myAssets = await getMyDepartmentAssets()
        setAssets(myAssets)
      } catch (err) {
        console.error('Gagal mengambil aset:', err)
      } finally {
        setIsLoadingAssets(false)
      }
    }
    loadAssets()
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isPending) {
      e.preventDefault()
      return
    }
  }

  // Categories
  const categories = [
    { value: 'Hardware', label: 'Perangkat Keras (Hardware)' },
    { value: 'Software', label: 'Perangkat Lunak (Software)' },
    { value: 'Network', label: 'Masalah Jaringan (Network)' },
    { value: 'Access/Auth', label: 'Akses & Hak Akses (Access)' },
    { value: 'Lainnya', label: 'Lain-lain' },
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
        className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-brand-primary transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Tiket
      </Link>

      <div className="bg-bg-card border border-border-card rounded-2xl p-6 md:p-8 shadow-sm transition duration-200">
        <div className="mb-6">
          <h1 className="text-xl font-black text-text-main tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-brand-light border border-brand-primary/10 text-brand-text rounded-lg shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            Buat Tiket Aduan Baru
          </h1>
          <p className="text-sm text-text-muted mt-1.5 font-medium">
            Jelaskan permasalahan IT Anda dengan detail agar tim Technician dapat segera menanganinya.
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold block">Gagal mengirim aduan:</span>
              <span className="text-xs font-medium">{state.error}</span>
            </div>
          </div>
        )}

        <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Judul Masalah / Aduan
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              placeholder="Contoh: Printer lantai 2 tidak bisa mencetak dokumen"
              className="w-full px-4 py-3 bg-bg-app border border-border-card rounded-xl text-sm text-text-main placeholder-text-muted/50 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition duration-200 shadow-inner"
            />
          </div>

          {/* Asset Selection */}
          <div>
            <label htmlFor="assetId" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Pilih Aset Bermasalah
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                <Laptop className="h-4.5 w-4.5" />
              </span>
              <select
                name="assetId"
                id="assetId"
                required
                defaultValue=""
                className="w-full pl-11 pr-4 py-3 bg-bg-app border border-border-card rounded-xl text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition duration-200 cursor-pointer shadow-inner font-medium"
              >
                <option value="" disabled>-- Pilih Aset Perangkat --</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_code} - {asset.name} ({asset.type})
                  </option>
                ))}
                {assets.length === 0 && !isLoadingAssets && (
                  <option value="">Umum / Tidak Ada Aset</option>
                )}
              </select>
            </div>
            {assets.length === 0 && !isLoadingAssets && (
              <p className="text-[10px] text-amber-500 mt-1.5 font-medium">
                Catatan: Akun Anda mungkin belum di-assign ke departemen atau departemen Anda belum memiliki aset terdaftar.
              </p>
            )}
          </div>

          {/* Grid Category & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Kategori Masalah
              </label>
              <select
                name="category"
                id="category"
                required
                defaultValue=""
                className="w-full px-4 py-3 bg-bg-app border border-border-card rounded-xl text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition duration-200 cursor-pointer shadow-inner font-medium"
              >
                <option value="" disabled>Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor="urgency" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Tingkat Urgensi
              </label>
              <select
                name="urgency"
                id="urgency"
                required
                defaultValue="low"
                className="w-full px-4 py-3 bg-bg-app border border-border-card rounded-xl text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition duration-200 cursor-pointer shadow-inner font-medium"
              >
                {urgencies.map((urg) => (
                  <option key={urg.value} value={urg.value}>{urg.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Deskripsi Masalah secara Detail
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows={5}
              placeholder="Deskripsikan secara detail langkah kejadian, error message (jika ada), dan tindakan yang sudah Anda lakukan..."
              className="w-full px-4 py-3 bg-bg-app border border-border-card rounded-xl text-sm text-text-main placeholder-text-muted/50 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition duration-200 resize-y shadow-inner"
            />
          </div>

          {/* Attachment URL */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Lampiran Pendukung (Opsional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                <Paperclip className="h-4.5 w-4.5" />
              </span>
              <input
                type="url"
                name="attachmentUrl"
                placeholder="https://imgur.com/screenshot.jpg (URL Gambar / File lampiran)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-bg-app border border-border-card rounded-xl text-sm text-text-main placeholder-text-muted/50 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition duration-200 shadow-inner"
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed font-medium">
              Masukkan tautan/URL tangkapan layar (screenshot) atau berkas pendukung Anda.
            </p>
          </div>

          {/* Submit and Cancel Button */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 mt-2 justify-end border-t border-border-card">
            <Link
              href="/tickets"
              className="px-5 py-2.5 border border-border-card bg-bg-app hover:bg-bg-card hover:text-text-main text-text-muted rounded-xl text-sm font-bold transition text-center shadow-sm"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-sm font-bold shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
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
