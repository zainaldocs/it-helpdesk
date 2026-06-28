'use client'

import { useState, useEffect } from 'react'
import { getAssets, createAsset, updateAsset, deleteAsset, getDepartments } from '@/app/actions/admin'
import { PlusCircle, Edit2, Trash2, Loader2, Laptop, X } from 'lucide-react'

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAsset, setCurrentAsset] = useState<any | null>(null) // null for create
  const [assetCode, setAssetCode] = useState('')
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('PC')
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [assetStatus, setAssetStatus] = useState('Active')
  const [specifications, setSpecifications] = useState('')
  const [error, setError] = useState('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [assets])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAssets = assets.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(assets.length / itemsPerPage)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const [assetsData, deptsData] = await Promise.all([
      getAssets(),
      getDepartments()
    ])
    setAssets(assetsData)
    setDepartments(deptsData)
    setIsLoading(false)
  }

  const handleOpenCreate = () => {
    setCurrentAsset(null)
    setAssetCode('')
    setAssetName('')
    setAssetType('PC')
    setSelectedDeptId(departments[0]?.id || '')
    setAssetStatus('Active')
    setSpecifications('')
    setError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (asset: any) => {
    setCurrentAsset(asset)
    setAssetCode(asset.asset_code)
    setAssetName(asset.name)
    setAssetType(asset.type)
    setSelectedDeptId(asset.department_id || '')
    setAssetStatus(asset.status)
    setSpecifications(asset.specifications || '')
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetCode.trim() || !assetName.trim() || !assetType.trim()) {
      setError('Semua kolom wajib diisi')
      return
    }

    setIsSubmitting(true)
    setError('')

    const payload = {
      asset_code: assetCode.trim().toUpperCase(),
      name: assetName.trim(),
      type: assetType.trim(),
      department_id: selectedDeptId || null,
      status: assetStatus,
      specifications: specifications.trim() || null
    }

    const result = currentAsset 
      ? await updateAsset(currentAsset.id, payload)
      : await createAsset(payload)

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsModalOpen(false)
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
      return
    }
    
    setIsLoading(true)
    const result = await deleteAsset(id)
    if (result.error) {
      alert('Gagal menghapus: ' + result.error)
    }
    fetchData()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Maintenance':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'Broken':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Kelola Aset Perangkat</h1>
          <p className="text-sm text-text-muted font-medium">Daftar semua inventaris aset IT yang dipetakan ke departemen perusahaan.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-sm font-bold shadow-md shadow-brand-primary/15 cursor-pointer transition"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Tambah Aset Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border-card rounded-2xl shadow-sm overflow-hidden transition duration-200">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <span className="text-sm font-medium">Memuat data aset...</span>
          </div>
        ) : assets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-app border-b border-border-card text-text-muted text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Kode Aset</th>
                  <th className="px-6 py-4">Nama Perangkat & Spesifikasi</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Departemen</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card text-sm">
                {currentAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-bg-app/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-text-muted">{asset.asset_code}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-light border border-brand-primary/10 rounded-lg text-brand-text flex-shrink-0">
                          <Laptop className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-text-main block truncate max-w-xs">{asset.name}</span>
                          {asset.specifications && (
                            <span className="text-[10px] text-text-muted font-medium block truncate max-w-xs" title={asset.specifications}>
                              {asset.specifications}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted font-medium">{asset.type}</td>
                    <td className="px-6 py-4 text-text-main font-semibold">
                      {asset.department ? asset.department.name : <span className="text-text-muted font-normal italic">Tidak ada</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusBadge(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          className="p-2 text-text-muted hover:text-brand-text hover:bg-brand-light border border-transparent hover:border-brand-primary/10 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-2 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition cursor-pointer"
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4.5 bg-bg-app border-t border-border-card text-xs">
                <div className="text-text-muted font-semibold">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, assets.length)} dari {assets.length} aset
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 border border-border-card bg-bg-card hover:bg-bg-app text-text-main font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3.5 py-2 border border-border-card bg-bg-card hover:bg-bg-app text-text-main font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-bg-app rounded-2xl border border-border-card text-text-muted">
              <Laptop className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-main">Belum Ada Aset Perangkat</h3>
              <p className="text-xs text-text-muted mt-1">Silakan daftarkan aset IT baru menggunakan tombol di atas.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="bg-bg-card rounded-2xl border border-border-card w-full max-w-md shadow-2xl z-10 overflow-hidden transform transition animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border-card bg-bg-app">
              <h3 className="font-bold text-text-main">
                {currentAsset ? 'Edit Aset' : 'Tambah Aset Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1.5 hover:bg-bg-app rounded-lg transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-500 rounded-xl font-medium">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assetCodeInput" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Kode Aset
                  </label>
                  <input
                    type="text"
                    id="assetCodeInput"
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="PC-FIN-001"
                    className="w-full px-4 py-2.5 bg-bg-app border border-border-card rounded-xl text-sm font-mono font-bold text-text-main uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="assetTypeSelect" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Tipe Perangkat
                  </label>
                  <select
                    id="assetTypeSelect"
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-app border border-border-card rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition"
                  >
                    <option value="PC">PC Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Printer">Printer</option>
                    <option value="Network">Jaringan / Router</option>
                    <option value="Server">Server</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="assetNameInput" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Nama Perangkat
                </label>
                <input
                  type="text"
                  id="assetNameInput"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Contoh: ThinkCentre M70, MacBook Air"
                  className="w-full px-4 py-2.5 bg-bg-app border border-border-card rounded-xl text-sm text-text-main font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="specificationsInput" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Spesifikasi Teknis
                </label>
                <textarea
                  id="specificationsInput"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="Contoh: Intel i5, RAM 16GB, SSD 512GB"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-bg-app border border-border-card rounded-xl text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition resize-none font-medium"
                />
              </div>

              <div>
                <label htmlFor="departmentSelect" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Departemen
                </label>
                <select
                  id="departmentSelect"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-app border border-border-card rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition"
                >
                  <option value="">-- Tanpa Departemen / Umum --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Status Operasional
                </label>
                <div className="flex gap-2">
                  {['Active', 'Maintenance', 'Broken'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAssetStatus(status)}
                      className={`flex-1 py-2 px-3 border rounded-xl text-xs font-bold transition cursor-pointer ${
                        assetStatus === status
                          ? status === 'Active'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                            : status === 'Maintenance'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-rose-500/10 border-rose-500 text-rose-500'
                          : 'bg-bg-app border border-border-card text-text-muted hover:bg-bg-app'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-card">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-text-muted hover:bg-bg-app border border-border-card rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-md shadow-brand-primary/15 cursor-pointer flex items-center gap-1.5 transition disabled:opacity-50"
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
