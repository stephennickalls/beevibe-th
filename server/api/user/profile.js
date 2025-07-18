// server/api/user/profile.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Use server-side config for API routes
  const supabase = createClient(
    config.supabaseUrl || config.public.supabaseUrl, 
    config.supabaseAnonKey || config.public.supabaseAnonKey
  )

  try {
    // Get the authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return { error: 'No authentication token provided' }
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return { error: 'Invalid authentication token' }
    }

    const userId = user.id

    if (getMethod(event) === 'GET') {
      // Get user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{ id: userId }])
            .select()
            .single()

          if (createError) throw createError
          return { data: newProfile }
        }
        throw error
      }

      return { data }
    }

    if (getMethod(event) === 'PUT') {
      // Update user profile
      const body = await readBody(event)
      
      const updateData = {
        username: body.username?.trim(),
        first_name: body.first_name?.trim(),
        last_name: body.last_name?.trim(),
        phone: body.phone?.trim(),
        company_name: body.company_name?.trim(),
        updated_at: new Date().toISOString()
      }

      // Remove empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key]
        }
      })

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { data }
    }

    return { error: 'Method not allowed' }
    
  } catch (error) {
    console.error('Profile API error:', error)
    return { error: error.message || 'Internal server error' }
  }
})