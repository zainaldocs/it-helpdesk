'use client'

import { logout } from '@/app/actions/auth'
import { Terminal, ShieldAlert, LogOut } from 'lucide-react'

export default function WaitingApprovalPage() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03]" />

      {/* Decorative gradient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 py-8 text-center">
        {/* Brand/Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
            IT Helpdesk
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-200">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center shadow-sm">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Menunggu Persetujuan</h2>
          <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
            Akun Anda berhasil didaftarkan tetapi saat ini sedang menunggu persetujuan (approval) dari Administrator. 
            Silakan hubungi IT Admin atau tunggu beberapa saat lagi sebelum mencoba masuk kembali.
          </p>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition duration-200 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Keluar & Coba Akun Lain
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
