'use client'

import { useState, useEffect } from 'react'
import { 
  getUsers, 
  approveUserRegistration, 
  updateUserProfile, 
  getDepartments,
  createUser,
  deleteUser
} from '@/app/actions/admin'
import { User, Shield, Check, Edit2, Trash2, Loader2, X, Briefcase, Filter, PlusCircle, Key } from 'lucide-react'

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  
  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('end_user')
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('active')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const [usersData, deptsData] = await Promise.all([
      getUsers(),
      getDepartments()
    ])
    setUsers(usersData)
    setDepartments(deptsData)
    setIsLoading(false)
  }

  const handleApprove = async (id: string) => {
    setIsLoading(true)
    const result = await approveUserRegistration(id)
    if (result.error) {
      alert('Gagal menyetujui user: ' + result.error)
    }
    fetchData()
  }

  const handleOpenCreate = () => {
    setModalMode('create')
    setCurrentUser(null)
    setFullName('')
    setEmail('')
    setPassword('')
    setSelectedRole('end_user')
    setSelectedDeptId('')
    setSelectedStatus('active')
    setError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user: any) => {
    setModalMode('edit')
    setCurrentUser(user)
    setFullName(user.full_name)
    setEmail(user.email)
    setPassword('') // Not needed for edit
    setSelectedRole(user.role)
    setSelectedDeptId(user.department_id || '')
    setSelectedStatus(user.account_status)
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    let result;
    if (modalMode === 'create') {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Semua kolom wajib diisi')
        setIsSubmitting(false)
        return
      }
      result = await createUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
        role: selectedRole,
        department_id: selectedDeptId || null
      })
    } else {
      result = await updateUserProfile(currentUser.id, {
        role: selectedRole,
        department_id: selectedDeptId || null,
        account_status: selectedStatus
      })
    }

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsModalOpen(false)
      fetchData()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${name}"? Tindakan ini akan menghapus akun autentikasi dan seluruh profil user.`)) {
      return
    }

    setIsLoading(true)
    const result = await deleteUser(id)
    if (result.error) {
      alert('Gagal menghapus user: ' + result.error)
    }
    fetchData()
  }

  const filteredUsers = users.filter((u) => {
    if (filterStatus === 'all') return true
    return u.account_status === filterStatus
  })

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Reset page when filters or data change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, users])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'technician':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'manager':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'technician': return 'IT Support'
      case 'manager': return 'Manager'
      default: return 'Karyawan'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
      case 'suspended':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Pengguna (Users)</h1>
          <p className="text-sm text-slate-500 font-medium">Setujui registrasi karyawan baru, tambahkan user, atau hapus dan atur departemen serta hak akses.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/15 cursor-pointer transition"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Tambah User Baru
        </button>
      </div>

      {/* Filter Tabs & Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
          {[
            { id: 'all', label: 'Semua Pengguna' },
            { id: 'pending', label: 'Menunggu Persetujuan' },
            { id: 'active', label: 'Aktif' },
            { id: 'suspended', label: 'Dinonaktifkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              {tab.id === 'pending' && users.filter(u => u.account_status === 'pending').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
                  {users.filter(u => u.account_status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="text-sm font-medium">Memuat data pengguna...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Nama & Email</th>
                    <th className="px-6 py-4">Peran (Role)</th>
                    <th className="px-6 py-4">Departemen</th>
                    <th className="px-6 py-4">Status Akun</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{u.full_name}</span>
                            <span className="text-xs text-slate-400 font-medium font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getRoleBadge(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-slate-900">
                        {u.department ? (
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                            {u.department.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal italic">Belum ditentukan</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold capitalize ${getStatusBadge(u.account_status)}`}>
                          {u.account_status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="inline-flex gap-2">
                          {u.account_status === 'pending' && (
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
                              title="Setujui Akun"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-100 rounded-lg transition cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.full_name)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition cursor-pointer"
                            title="Hapus User"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs">
                <div className="text-slate-500 font-semibold">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} pengguna
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          ) : (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tidak Ada Pengguna</h3>
                <p className="text-xs text-slate-500 mt-1">Tidak ada data pengguna yang sesuai dengan filter.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl z-10 overflow-hidden transform transition animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-purple-600" />
                {modalMode === 'create' ? 'Tambah User Baru' : 'Atur Akses User'}
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

              {modalMode === 'edit' ? (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    {fullName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{fullName}</span>
                    <span className="text-xs text-slate-400 font-semibold font-mono">{email}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="fullNameInput" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      id="fullNameInput"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emailInput" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Email Perusahaan
                    </label>
                    <input
                      type="email"
                      id="emailInput"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@company.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="passwordInput" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Kata Sandi (Password)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Key className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        id="passwordInput"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        minLength={6}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Peran (Role)
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                >
                  <option value="end_user">End-User (Karyawan)</option>
                  <option value="manager">Manager Departemen</option>
                  <option value="technician">Technician (IT Support)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Departemen
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                >
                  <option value="">-- Belum Ditentukan / Tidak Ada --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Status Akun
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'active', label: 'Aktif' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'suspended', label: 'Suspend' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStatus(s.id)}
                        className={`flex-1 py-2 px-3 border rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedStatus === s.id
                            ? s.id === 'active'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                              : s.id === 'pending'
                              ? 'bg-amber-50 border-amber-500 text-amber-700'
                              : 'bg-rose-50 border-rose-500 text-rose-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                      Memproses...
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
