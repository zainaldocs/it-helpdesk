'use client'

import { logout } from '@/app/actions/auth'
import { Terminal, ShieldX, LogOut } from 'lucide-react'

export default function SuspendedPage() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03]" />

      {/* Decorative gradient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 py-8 text-center">
        {/* Brand/Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-rose-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
            IT Helpdesk
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-200">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center shadow-sm">
              <ShieldX className="h-8 w-8" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Akun Dinonaktifkan</h2>
          <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
            Akun Anda saat ini telah dinonaktifkan (suspended) oleh Administrator. 
            Silakan hubungi IT Admin untuk klarifikasi atau bantuan lebih lanjut.
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
