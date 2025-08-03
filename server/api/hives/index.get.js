// server/api/hives/index.get.js - Fixed with enhanced authentication and debugging
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== HIVES API START ===')
    
    // Get runtime configuration
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey
    
    if (!supabaseUrl || !anonKey) {
      console.error('Missing Supabase URL or anon key')
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    if (!serviceRoleKey) {
      console.error('Missing service role key')
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase service role key'
      })
    }

    // Step 1: Extract and validate authentication token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.error('No token in authorization header')
      throw createError({
        statusCode: 401,
        statusMessage: 'Valid token required'
      })
    }

    console.log('Token received, length:', token.length)

    // Step 2: Authenticate user with anon client
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    if (!user) {
      console.error('No user returned from auth')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    console.log(`✅ Authenticated user: ${user.id} (${user.email})`)

    // Step 3: Query database with service role - HIVES WITH APIARY DATA
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    console.log('Querying hives for user:', user.id)
    
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

    console.log(`✅ Query successful. Found ${hives?.length || 0} hives for user ${user.id}`)
    
    // Debug: Log each hive's user_id to verify ownership
    if (hives && hives.length > 0) {
      console.log('Hive ownership verification:')
      hives.forEach(hive => {
        console.log(`  - Hive ${hive.id} (${hive.name}): belongs to ${hive.user_id}`)
        if (hive.user_id !== user.id) {
          console.error(`  ⚠️  WARNING: Hive ${hive.id} user_id mismatch!`)
        }
      })
    }

    console.log('=== HIVES API END ===')

    return {
      success: true,
      data: hives || [],
      count: hives?.length || 0,
      user_id: user.id,
      debug: {
        authenticated_user: user.id,
        query_user_filter: user.id,
        hives_found: hives?.length || 0
      }
    }

  } catch (error) {
    console.error('Hives API error:', error)
    
    // If it's already a structured error, throw it as-is
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise wrap in a generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching hives'
    })
  }
})