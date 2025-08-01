// server/api/hives/index.get.js - Updated for apiary structure
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Get runtime configuration
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey
    
    if (!supabaseUrl || !anonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    if (!serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase service role key'
      })
    }

    // Step 1: Extract and validate authentication token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Valid token required'
      })
    }

    // Step 2: Authenticate user with anon client
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    console.log(`Fetching hives for user: ${user.id}`)

    // Step 3: Query database with service role - HIVES WITH APIARY DATA
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    const { data: hives, error: queryError } = await serviceClient
      .from('hives')
      .select(`
        id,
        uuid,
        name,
        description,
        apiary_id,
        installation_date,
        is_active,
        created_at,
        updated_at,
        user_id,
        created_by,
        apiary:apiaries(
          id,
          name,
          description,
          latitude,
          longitude,
          address
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('Database query error:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch hives from database'
      })
    }

    console.log(`Successfully fetched ${hives?.length || 0} hives for user ${user.id}`)

    return {
      success: true,
      data: hives || [],
      count: hives?.length || 0,
      user_id: user.id
    }

  } catch (error) {
    console.error('Hives API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching hives'
    })
  }
})