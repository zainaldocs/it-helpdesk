'use client'

import { useActionState, startTransition, useState } from 'react'
import { register } from '@/app/actions/auth'
import Link from 'next/link'
import { Terminal, Lock, Mail, User, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'

const initialState: { error?: string; success?: string } = {}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState)
  const [selectedRole, setSelectedRole] = useState('end_user')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

      {/* Decorative gradient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 py-8">
        {/* Brand/Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
            IT Helpdesk
          </span>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white tracking-tight">Buat Akun Baru</h2>
            <p className="text-sm text-slate-400 mt-1.5">Mulai kelola kebutuhan IT Support perusahaan Anda.</p>
          </div>

          {state?.error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-sm text-red-400 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="font-semibold">Galat:</span>
              <span>{state.error}</span>
            </div>
          )}

          {state?.success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-sm text-emerald-300 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Registrasi Berhasil!</span>
              </div>
              <p className="text-emerald-400/80 ml-7">
                {state.success} Silakan{' '}
                <Link href="/login" className="underline font-semibold text-white hover:text-slate-200 transition">
                  Login di sini
                </Link>
                .
              </p>
            </div>
          )}

          {!state?.success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Perusahaan
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="john.doe@company.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    placeholder="Min. 6 karakter"
                    minLength={6}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pilih Peran (Role)
                </label>
                <input type="hidden" name="role" value={selectedRole} />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'end_user', label: 'End-User', desc: 'Melaporkan Isu' },
                    { id: 'technician', label: 'Technician', desc: 'Menangani Isu' },
                    { id: 'admin', label: 'Admin', desc: 'Full Akses' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition duration-200 ${
                        selectedRole === role.id
                          ? 'border-blue-500 bg-blue-600/10 text-white'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{role.label}</span>
                        {selectedRole === role.id && <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{role.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98] transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Daftar'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition duration-200">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
