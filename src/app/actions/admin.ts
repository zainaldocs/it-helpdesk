'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Helper function to create an admin client that uses the service_role key to bypass RLS and edit auth.users
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables')
  }
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Only Admins can perform this action')
  }
  return supabase
}

// ==========================================
// USER MANAGEMENT ACTIONS
// ==========================================

export async function getUsers() {
  try {
    const supabase = await checkAdmin()
    const { data, error } = await supabase
      .from('profiles')
      .select('*, department:departments(id, name)')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('getUsers error:', error)
    return []
  }
}

export async function createUser(data: { fullName: string; email: string; password: string; role: string; department_id: string | null }) {
  try {
    await checkAdmin()
    const adminClient = getAdminClient()
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { 
        full_name: data.fullName,
        role: data.role
      }
    })
    
    if (authError) throw authError
    if (!authData.user) throw new Error('Gagal membuat user autentikasi')
    
    // Update the newly created profile with department_id and status 'active'
    // (Note: profiles is automatically created by the public.handle_new_user trigger)
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        department_id: data.department_id,
        account_status: 'active'
      })
      .eq('id', authData.user.id)
      
    if (profileError) throw profileError
    
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('createUser error:', error)
    return { error: error.message }
  }
}

export async function deleteUser(userId: string) {
  try {
    await checkAdmin()
    const adminClient = getAdminClient()
    
    // Delete the user from Supabase Auth
    // This will cascade-delete their profile automatically because of the CASCADE foreign key
    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) throw error
    
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('deleteUser error:', error)
    return { error: error.message }
  }
}

export async function approveUserRegistration(userId: string) {
  try {
    const supabase = await checkAdmin()
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: 'active' })
      .eq('id', userId)
      
    if (error) throw error
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('approveUserRegistration error:', error)
    return { error: error.message }
  }
}

export async function updateUserProfile(userId: string, data: { role?: string; department_id?: string | null; account_status?: string }) {
  try {
    const supabase = await checkAdmin()
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      
    if (error) throw error
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('updateUserProfile error:', error)
    return { error: error.message }
  }
}

// ==========================================
// DEPARTMENT ACTIONS
// ==========================================

export async function getDepartments() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')
      
    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('getDepartments error:', error)
    return []
  }
}

export async function createDepartment(name: string) {
  try {
    const supabase = await checkAdmin()
    const { error } = await supabase
      .from('departments')
      .insert({ name })
      
    if (error) throw error
    revalidatePath('/admin/departments')
    return { success: true }
  } catch (error: any) {
    console.error('createDepartment error:', error)
    return { error: error.message }
  }
}

export async function updateDepartment(id: string, name: string) {
  try {
    const supabase = await checkAdmin()
    const { error } = await supabase
      .from('departments')
      .update({ name })
      .eq('id', id)
      
    if (error) throw error
    revalidatePath('/admin/departments')
    return { success: true }
  } catch (error: any) {
    console.error('updateDepartment error:', error)
    return { error: error.message }
  }
}

export async function deleteDepartment(id: string) {
  try {
    const supabase = await checkAdmin()
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)
      
    if (error) throw error
    revalidatePath('/admin/departments')
    return { success: true }
  } catch (error: any) {
    console.error('deleteDepartment error:', error)
    return { error: error.message }
  }
}

// ==========================================
// ASSET ACTIONS
// ==========================================

export async function getAssets() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('assets')
      .select('*, department:departments(id, name)')
      .order('asset_code')
      
    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('getAssets error:', error)
    return []
  }
}

export async function createAsset(data: { asset_code: string; name: string; type: string; department_id: string | null; status: string; specifications?: string | null }) {
  try {
    const supabase = await checkAdmin()
    const { error } = await supabase
      .from('assets')
      .insert(data)
      
    if (error) throw error
    revalidatePath('/admin/assets')
    return { success: true }
  } catch (error: any) {
    console.error('createAsset error:', error)
    return { error: error.message }
  }
}

export async function updateAsset(id: string, data: { asset_code?: string; name?: string; type?: string; department_id?: string | null; status?: string; specifications?: string | null }) {
  try {
    const supabase = await checkAdmin()
    const { error } = await supabase
      .from('assets')
      .update(data)
      .eq('id', id)
      
    if (error) throw error
    revalidatePath('/admin/assets')
    return { success: true }
  } catch (error: any) {
    console.error('updateAsset error:', error)
    return { error: error.message }
  }
}

export async function deleteAsset(id: string) {
  try {
    const supabase = await checkAdmin()
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      
    if (error) throw error
    revalidatePath('/admin/assets')
    return { success: true }
  } catch (error: any) {
    console.error('deleteAsset error:', error)
    return { error: error.message }
  }
}
