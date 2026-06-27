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
    attachment_url: attachmentUrl,
    status: 'open',
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
      creator:profiles!tickets_created_by_fkey(full_name, email),
      assignee:profiles!tickets_assigned_to_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  // If user is an end_user, only load their own tickets
  if (profile.role === 'end_user') {
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
      creator:profiles!tickets_created_by_fkey(full_name, email),
      assignee:profiles!tickets_assigned_to_fkey(full_name, email)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Gagal mengambil detail tiket:', error)
    return null
  }

  return data
}

export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') {
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
  if (!user) return { open: 0, in_progress: 0, resolved: 0, closed: 0, total: 0 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return { open: 0, in_progress: 0, resolved: 0, closed: 0, total: 0 }

  let query = supabase.from('tickets').select('status')

  if (profile.role === 'end_user') {
    query = query.eq('created_by', user.id)
  }

  const { data, error } = await query
  if (error || !data) return { open: 0, in_progress: 0, resolved: 0, closed: 0, total: 0 }

  const metrics = {
    open: data.filter((t) => t.status === 'open').length,
    in_progress: data.filter((t) => t.status === 'in_progress').length,
    resolved: data.filter((t) => t.status === 'resolved').length,
    closed: data.filter((t) => t.status === 'closed').length,
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
