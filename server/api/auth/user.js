// server/api/auth/user.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Use server-side config for API routes
  const supabase = createClient(
    config.supabaseUrl || config.public.supabaseUrl, 
    config.supabaseAnonKey || config.public.supabaseAnonKey
  )

  try {
    if (getMethod(event) !== 'GET') {
      return { error: 'Method not allowed' }
    }

    // Get the authorization header (this should be the Supabase JWT token)
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return { error: 'No authentication token provided' }
    }

    // Set the auth token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error) {
      return { error: 'Invalid authentication token' }
    }

    if (!user) {
      return { error: 'User not found' }
    }

    // Return only safe user data
    const userData = {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      created_at: user.created_at,
      updated_at: user.updated_at
    }

    return { data: userData }
    
  } catch (error) {
    console.error('Auth user API error:', error)
    return { error: error.message || 'Internal server error' }
  }
})