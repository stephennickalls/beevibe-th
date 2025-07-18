// server/api/auth/change-password.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Use server-side config for API routes
  const supabase = createClient(
    config.supabaseUrl || config.public.supabaseUrl, 
    config.supabaseAnonKey || config.public.supabaseAnonKey
  )

  try {
    if (getMethod(event) !== 'PUT') {
      return { error: 'Method not allowed' }
    }

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

    const body = await readBody(event)
    
    if (!body.current_password || !body.new_password) {
      return { error: 'Current password and new password are required' }
    }

    if (body.new_password.length < 6) {
      return { error: 'New password must be at least 6 characters long' }
    }

    // First, verify the current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: body.current_password
    })

    if (signInError) {
      return { error: 'Current password is incorrect' }
    }

    // Update password - this requires the service role key for admin operations
    // For now, we'll use the regular client and let the user handle the password change
    // through Supabase's built-in password update functionality
    
    // Create a new client instance with the user's session
    const userSupabase = createClient(
      config.supabaseUrl || config.public.supabaseUrl, 
      config.supabaseAnonKey || config.public.supabaseAnonKey
    )

    // Set the session
    await userSupabase.auth.setSession({
      access_token: token,
      refresh_token: '', // We don't have the refresh token here
    })

    // Update the user's password
    const { error: updateError } = await userSupabase.auth.updateUser({
      password: body.new_password
    })

    if (updateError) {
      return { error: updateError.message }
    }

    return { data: { message: 'Password updated successfully' } }
    
  } catch (error) {
    console.error('Change password API error:', error)
    return { error: error.message || 'Internal server error' }
  }
})