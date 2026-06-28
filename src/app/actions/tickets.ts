'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export interface CreateTicketState {
  error?: string
  success?: string
}

export async function createTicket(prevState: any, formData: FormData): Promise<CreateTicketState> {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const urgency = formData.get('urgency') as string
  const assetId = formData.get('assetId') as string || null
  const attachmentUrl = formData.get('attachmentUrl') as string || null

  if (!title || !description || !category || !urgency) {
    return { error: 'Semua kolom wajib diisi.' }
  }

  const supabase = await createClient()

  // Get current user id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Anda harus masuk terlebih dahulu.' }
  }

  const { error } = await supabase.from('tickets').insert({
    title,
    description,
    category,
    urgency,
    created_by: user.id,
    asset_id: assetId,
    attachment_url: attachmentUrl,
    status: 'pending_approval',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tickets')
  redirect('/tickets')
}

export async function getTickets() {
  const supabase = await createClient()

  // Get current user details
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  let query = supabase
    .from('tickets')
    .select(`
      *,
      creator:profiles!tickets_created_by_fkey(full_name, email, department_id),
      assignee:profiles!tickets_assigned_to_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  // If user is an end_user or manager, only load their own tickets
  // Managers will see other users' request approvals in a separate query
  if (profile.role === 'end_user' || profile.role === 'manager') {
    query = query.eq('created_by', user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Gagal mengambil tiket:', error)
    return []
  }

  return data
}

export async function getTicketById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      creator:profiles!tickets_created_by_fkey(full_name, email, department_id, department:departments(name)),
      assignee:profiles!tickets_assigned_to_fkey(full_name, email),
      asset:assets(asset_code, name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Gagal mengambil detail tiket:', error)
    return null
  }

  return data
}

export async function updateTicketStatus(
  ticketId: string, 
  status: 'pending_approval' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
) {
  const supabase = await createClient()

  // Verify permission: only Admin/Technician can change status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'technician')) {
    return { error: 'Hanya Admin atau Technician yang dapat mengubah status tiket.' }
  }

  const { error } = await supabase
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath('/')
  return { success: 'Status berhasil diperbarui.' }
}

export async function assignTicket(ticketId: string, assignedTo: string | null) {
  const supabase = await createClient()

  // Verify permission: only Admin/Technician can assign
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'technician')) {
    return { error: 'Hanya Admin atau Technician yang dapat menugaskan tiket.' }
  }

  const { error } = await supabase
    .from('tickets')
    .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/tickets/${ticketId}`)
  return { success: 'Tiket berhasil ditugaskan.' }
}

export async function getTicketMetrics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { pending_approval: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, cancelled: 0, total: 0 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return { pending_approval: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, cancelled: 0, total: 0 }

  let query = supabase.from('tickets').select('status')

  if (profile.role === 'end_user' || profile.role === 'manager') {
    query = query.eq('created_by', user.id)
  }

  const { data, error } = await query
  if (error || !data) return { pending_approval: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, cancelled: 0, total: 0 }

  const metrics = {
    pending_approval: data.filter((t) => t.status === 'pending_approval').length,
    open: data.filter((t) => t.status === 'open').length,
    in_progress: data.filter((t) => t.status === 'in_progress').length,
    resolved: data.filter((t) => t.status === 'resolved').length,
    closed: data.filter((t) => t.status === 'closed').length,
    cancelled: data.filter((t) => t.status === 'cancelled').length,
    total: data.length,
  }

  return metrics
}

export async function getTechnicians() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['admin', 'technician'])
    .order('full_name')

  if (error) {
    console.error('Gagal mengambil daftar teknisi:', error)
    return []
  }

  return data
}

export async function getMyDepartmentAssets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('department_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.department_id) return []

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('department_id', profile.department_id)
    .eq('status', 'Active')
    .order('name')

  if (error) {
    console.error('Gagal mengambil aset departemen:', error)
    return []
  }
  return data
}

export async function getDepartmentPendingTickets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, department_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'manager' || !profile.department_id) return []

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      creator:profiles!tickets_created_by_fkey(full_name, email, department_id),
      asset:assets(asset_code, name)
    `)
    .eq('status', 'pending_approval')
    
  if (error) {
    console.error('Gagal mengambil tiket approval:', error)
    return []
  }

  const filtered = data.filter(t => t.creator?.department_id === profile.department_id)
  return filtered
}

export async function approveTicket(ticketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'manager') {
    return { error: 'Hanya Manager yang dapat menyetujui tiket.' }
  }

  const { error } = await supabase
    .from('tickets')
    .update({ 
      status: 'open', 
      approved_by: user.id, 
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id', ticketId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/manager/approvals')
  revalidatePath(`/tickets/${ticketId}`)
  return { success: true }
}

export async function cancelTicket(ticketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'manager') {
    return { error: 'Hanya Manager yang dapat membatalkan tiket.' }
  }

  const { error } = await supabase
    .from('tickets')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString() 
    })
    .eq('id', ticketId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/manager/approvals')
  revalidatePath(`/tickets/${ticketId}`)
  return { success: true }
}

