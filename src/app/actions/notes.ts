'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNote(ticketId: string, content: string, isInternal: boolean) {
  if (!content.trim()) {
    return { error: 'Catatan tidak boleh kosong.' }
  }

  const supabase = await createClient()

  // Get current user id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Anda harus masuk terlebih dahulu.' }
  }

  // Insert note
  const { error } = await supabase.from('ticket_notes').insert({
    ticket_id: ticketId,
    user_id: user.id,
    content,
    is_internal: isInternal,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/tickets/${ticketId}`)
  return { success: 'Catatan berhasil ditambahkan.' }
}

export async function getNotes(ticketId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ticket_notes')
    .select(`
      *,
      user:profiles(full_name, email, role)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Gagal mengambil catatan:', error)
    return []
  }

  return data
}
