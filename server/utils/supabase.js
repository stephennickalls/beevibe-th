// server/utils/supabase.js - Simple version to avoid initialization issues
import { createClient } from '@supabase/supabase-js'

// Helper to get authenticated user from request
export const getAuthenticatedUser = async (event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No authorization header provided'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No token provided'
    })
  }

  // Get config inside the function to avoid initialization issues
  const config = useRuntimeConfig()
  const supabaseUrl = config.public?.supabaseUrl
  const supabaseKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
  
  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Supabase configuration'
    })
  }

  const client = createClient(supabaseUrl, supabaseKey)
  const { data: { user }, error } = await client.auth.getUser(token)

  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }

  return { user, supabase: client }
}

// Server-side client with request context
export const serverSupabaseClient = (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public?.supabaseUrl
  const supabaseKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
  
  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Supabase configuration'
    })
  }
  
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Get the authorization header from the request
  const authHeader = getHeader(event, 'authorization')
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    client.auth.setSession({
      access_token: token,
      refresh_token: ''
    })
  }

  return client
}