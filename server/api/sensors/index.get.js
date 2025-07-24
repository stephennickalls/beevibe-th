// server/api/sensors/index.get.js - Simple sensors with working authentication
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Get runtime configuration
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
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

    console.log(`Fetching sensors for user: ${user.id}`)

    // Step 3: Get query parameters for optional filtering
    const query = getQuery(event)

    // Step 4: Query database with service role - SENSORS ONLY
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    let dbQuery = serviceClient
      .from('sensors')
      .select(`
        id,
        sensor_type,
        name,
        model,
        hive_id,
        user_id,
        is_online,
        battery_level,
        last_reading_at,
        created_at,
        updated_at,
        hives (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Optional filtering by hive_id
    if (query.hive_id) {
      dbQuery = dbQuery.eq('hive_id', parseInt(query.hive_id))
    }

    const { data: sensors, error: queryError } = await dbQuery

    if (queryError) {
      console.error('Database query error:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch sensors from database'
      })
    }

    console.log(`Successfully fetched ${sensors?.length || 0} sensors for user ${user.id}`)

    return {
      success: true,
      data: sensors || [],
      count: sensors?.length || 0,
      user_id: user.id
    }

  } catch (error) {
    console.error('Sensors API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching sensors'
    })
  }
})