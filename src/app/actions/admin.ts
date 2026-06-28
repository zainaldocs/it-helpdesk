'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function createAsset(data: { asset_code: string; name: string; type: string; department_id: string | null; status: string }) {
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

export async function updateAsset(id: string, data: { asset_code?: string; name?: string; type?: string; department_id?: string | null; status?: string }) {
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
