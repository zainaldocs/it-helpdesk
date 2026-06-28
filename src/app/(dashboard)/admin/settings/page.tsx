'use client'

import { useState, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'

interface ThemeOption {
  id: string
  name: string
  accentColor: string
  bgColor: string
  cardColor: string
  borderColor: string
  textColor: string
  description: string
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light-purple',
    name: 'Light Purple (Default)',
    accentColor: '#9333ea', // purple-600
    bgColor: '#f8fafc',
    cardColor: '#ffffff',
    borderColor: '#e2e8f0',
    textColor: '#0f172a',
    description: 'Nuansa warna ungu default yang bersih dan premium.',
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    accentColor: '#2563eb', // blue-600
    bgColor: '#f0f4fa',
    cardColor: '#ffffff',
    borderColor: '#dbe2ef',
    textColor: '#112233',
    description: 'Warna biru korporat yang tenang dan profesional.',
  },
  {
    id: 'light-green',
    name: 'Light Green',
    accentColor: '#16a34a', // green-600
    bgColor: '#f4f8f5',
    cardColor: '#ffffff',
    borderColor: '#dcfce7',
    textColor: '#052e16',
    description: 'Tema warna hijau segar yang nyaman untuk mata.',
  },
  {
    id: 'light-red',
    name: 'Light Red',
    accentColor: '#dc2626', // red-600
    bgColor: '#fbf7f7',
    cardColor: '#ffffff',
    borderColor: '#fee2e2',
    textColor: '#450a0a',
    description: 'Nuansa merah tegas untuk tampilan dinamis.',
  },
  {
    id: 'light-orange',
    name: 'Light Orange',
    accentColor: '#ea580c', // orange-600
    bgColor: '#fffaf5',
    cardColor: '#ffffff',
    borderColor: '#ffedd5',
    textColor: '#431407',
    description: 'Warna oranye hangat yang modern dan kreatif.',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    accentColor: '#a855f7', // purple-500
    bgColor: '#0b0f19',
    cardColor: '#141d2e',
    borderColor: '#1e293b',
    textColor: '#f8fafc',
    description: 'Mode gelap elegan untuk lingkungan kerja redup.',
  },
]

export default function SettingsPage() {
  const [activeTheme, setActiveTheme] = useState('light-purple')

  useEffect(() => {
    const savedTheme = localStorage.getItem('it-helpdesk-theme') || 'light-purple'
    setActiveTheme(savedTheme)
  }, [])

  const handleSelectTheme = (themeId: string) => {
    localStorage.setItem('it-helpdesk-theme', themeId)
    document.documentElement.setAttribute('data-theme', themeId)
    setActiveTheme(themeId)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-2">
            <Palette className="h-6 w-6 text-brand-primary" />
            Pengaturan Tema Aplikasi
          </h1>
          <p className="text-sm text-text-muted font-medium">Ubah skema warna visual aplikasi IT Helpdesk ini secara instan sesuai kebutuhan Anda.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = activeTheme === theme.id
          
          return (
            <div
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`group relative rounded-2xl border bg-bg-card p-5 flex flex-col justify-between gap-5 transition cursor-pointer hover:shadow-xl hover:shadow-brand-primary/5 hover:border-brand-primary/40 ${
                isSelected
                  ? 'border-brand-primary shadow-lg ring-1 ring-brand-primary shadow-brand-primary/5'
                  : 'border-border-card shadow-sm'
              }`}
            >
              {/* Header inside Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-text-main text-sm group-hover:text-brand-primary transition">
                    {theme.name}
                  </h3>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-brand-primary text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  {theme.description}
                </p>
              </div>

              {/* Palette Demo Mockup */}
              <div 
                style={{ backgroundColor: theme.bgColor }}
                className="w-full h-24 rounded-xl border border-slate-200/10 p-3.5 flex flex-col justify-between shadow-inner overflow-hidden"
              >
                {/* Simulated Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div 
                      style={{ backgroundColor: theme.accentColor }}
                      className="h-3 w-3 rounded-full"
                    />
                    <div 
                      style={{ color: theme.textColor }}
                      className="h-2 w-10 rounded bg-slate-400/20"
                    />
                  </div>
                  <div className="h-2 w-6 rounded bg-slate-400/20" />
                </div>

                {/* Simulated Content Box */}
                <div 
                  style={{ backgroundColor: theme.cardColor, borderColor: theme.borderColor }}
                  className="flex-1 mt-2.5 rounded-lg border p-2 flex items-center justify-between shadow-sm"
                >
                  <div className="space-y-1 w-2/3">
                    <div className="h-2 w-full rounded bg-slate-400/20" />
                    <div className="h-1.5 w-1/2 rounded bg-slate-400/20" />
                  </div>
                  <div 
                    style={{ backgroundColor: theme.accentColor }}
                    className="h-4.5 w-8 rounded-md shadow-sm"
                  />
                </div>
              </div>

              {/* Footer Button / Selected label */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectTheme(theme.id)
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15'
                    : 'bg-bg-app border border-border-card text-text-main hover:bg-brand-light/35 hover:text-brand-text'
                }`}
              >
                {isSelected ? 'Tema Aktif' : 'Terapkan Tema'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
