'use client'

import { useState, useEffect, startTransition } from 'react'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/app/actions/admin'
import { PlusCircle, Edit2, Trash2, Loader2, Briefcase, X } from 'lucide-react'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDept, setCurrentDept] = useState<any | null>(null) // null for create, object for edit
  const [deptName, setDeptName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setIsLoading(true)
    const data = await getDepartments()
    setDepartments(data)
    setIsLoading(false)
  }

  const handleOpenCreate = () => {
    setCurrentDept(null)
    setDeptName('')
    setError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (dept: any) => {
    setCurrentDept(dept)
    setDeptName(dept.name)
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName.trim()) {
      setError('Nama departemen wajib diisi')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = currentDept 
      ? await updateDepartment(currentDept.id, deptName.trim())
      : await createDepartment(deptName.trim())

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsModalOpen(false)
      fetchDepartments()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus departemen ini? Semua aset yang terikat mungkin akan terpengaruh.')) {
      return
    }
    
    setIsLoading(true)
    const result = await deleteDepartment(id)
    if (result.error) {
      alert('Gagal menghapus: ' + result.error)
    }
    fetchDepartments()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Departemen</h1>
          <p className="text-sm text-slate-500 font-medium">Daftar departemen perusahaan untuk mengorganisir user dan aset.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/15 cursor-pointer transition"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Tambah Departemen
        </button>
      </div>

      {/* Table / Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="text-sm font-medium">Memuat data departemen...</span>
          </div>
        ) : departments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Nama Departemen</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4.5 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="p-2 bg-purple-50 border border-purple-100 rounded-lg text-purple-600">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      {dept.name}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-100 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Belum Ada Departemen</h3>
              <p className="text-xs text-slate-500 mt-1">Silakan tambahkan departemen baru menggunakan tombol di atas.</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl z-10 overflow-hidden transform transition animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">
                {currentDept ? 'Edit Departemen' : 'Tambah Departemen'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl font-medium">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nama Departemen
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Contoh: Finance, Marketing, IT"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 font-medium transition"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/15 cursor-pointer flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
