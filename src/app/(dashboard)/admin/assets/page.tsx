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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Broken':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Aset Perangkat</h1>
          <p className="text-sm text-slate-500 font-medium">Daftar semua inventaris aset IT yang dipetakan ke departemen perusahaan.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/15 cursor-pointer transition"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Tambah Aset Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="text-sm font-medium">Memuat data aset...</span>
          </div>
        ) : assets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Kode Aset</th>
                  <th className="px-6 py-4">Nama Perangkat & Spesifikasi</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Departemen</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">{asset.asset_code}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 border border-purple-100 rounded-lg text-purple-600 flex-shrink-0">
                          <Laptop className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate max-w-xs">{asset.name}</span>
                          {asset.specifications && (
                            <span className="text-[10px] text-slate-400 font-medium block truncate max-w-xs" title={asset.specifications}>
                              {asset.specifications}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{asset.type}</td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">
                      {asset.department ? asset.department.name : <span className="text-slate-400 font-normal italic">Tidak ada</span>}
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
                          className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-100 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
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
              <Laptop className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Belum Ada Aset Perangkat</h3>
              <p className="text-xs text-slate-500 mt-1">Silakan daftarkan aset IT baru menggunakan tombol di atas.</p>
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
          
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl z-10 overflow-hidden transform transition animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">
                {currentAsset ? 'Edit Aset' : 'Tambah Aset Baru'}
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assetCodeInput" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kode Aset
                  </label>
                  <input
                    type="text"
                    id="assetCodeInput"
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="PC-FIN-001"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="assetTypeSelect" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Tipe Perangkat
                  </label>
                  <select
                    id="assetTypeSelect"
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
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
                <label htmlFor="assetNameInput" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nama Perangkat
                </label>
                <input
                  type="text"
                  id="assetNameInput"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Contoh: ThinkCentre M70, MacBook Air"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="specificationsInput" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Spesifikasi Teknis
                </label>
                <textarea
                  id="specificationsInput"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="Contoh: Intel i5, RAM 16GB, SSD 512GB"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition resize-none font-medium"
                />
              </div>

              <div>
                <label htmlFor="departmentSelect" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Departemen
                </label>
                <select
                  id="departmentSelect"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                >
                  <option value="">-- Tanpa Departemen / Umum --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
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
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : status === 'Maintenance'
                            ? 'bg-amber-50 border-amber-500 text-amber-700'
                            : 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
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
