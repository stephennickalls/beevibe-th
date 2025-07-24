// server/api/readings/latest.get.js - Simple latest readings with working authentication
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

    console.log(`Fetching latest readings for user: ${user.id}`)

    // Step 3: Get query parameters
    const query = getQuery(event)

    // Step 4: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    // Get user's hive IDs for security
    const { data: userHives, error: hivesError } = await serviceClient
      .from('hives')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (hivesError) {
      console.error('Error fetching user hives:', hivesError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user hives'
      })
    }

    const hiveIds = userHives?.map(h => h.id) || []
    if (hiveIds.length === 0) {
      console.log(`No hives found for user ${user.id}`)
      return {
        success: true,
        data: [],
        count: 0,
        user_id: user.id
      }
    }

    // Filter by specific hives if requested
    let targetHiveIds = hiveIds
    if (query.hive_ids) {
      const requestedIds = query.hive_ids.split(',').map(id => parseInt(id))
      targetHiveIds = hiveIds.filter(id => requestedIds.includes(id))
      console.log(`Filtering to specific hives: ${targetHiveIds}`)
    }

    if (targetHiveIds.length === 0) {
      console.log('No target hives after filtering')
      return {
        success: true,
        data: [],
        count: 0,
        user_id: user.id
      }
    }

    // Try to get latest readings using RPC function first
    try {
      const { data: latestReadings, error: rpcError } = await serviceClient
        .rpc('get_latest_readings_per_hive', { 
          target_hive_ids: targetHiveIds 
        })

      if (rpcError) throw rpcError

      console.log(`Successfully fetched ${latestReadings?.length || 0} latest readings using RPC for user ${user.id}`)

      return {
        success: true,
        data: latestReadings || [],
        count: latestReadings?.length || 0,
        user_id: user.id
      }

    } catch (rpcError) {
      console.log('RPC function not available, using fallback query:', rpcError.message)
      
      // Fallback: Get latest reading per sensor type per hive using regular query
      const { data: allReadings, error: readingsError } = await serviceClient
        .from('sensor_readings')
        .select(`
          hive_id,
          sensor_id,
          sensor_type,
          value,
          unit,
          reading_time,
          signal_strength
        `)
        .in('hive_id', targetHiveIds)
        .order('reading_time', { ascending: false })
        .limit(1000) // Get recent readings to process

      if (readingsError) {
        console.error('Error fetching readings:', readingsError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch sensor readings'
        })
      }

      // Group by hive_id and sensor_type to get latest for each
      const latestByHiveAndType = {}
      
      allReadings?.forEach(reading => {
        const key = `${reading.hive_id}-${reading.sensor_type}`
        if (!latestByHiveAndType[key] || 
            new Date(reading.reading_time) > new Date(latestByHiveAndType[key].reading_time)) {
          latestByHiveAndType[key] = reading
        }
      })

      const fallbackReadings = Object.values(latestByHiveAndType)

      console.log(`Successfully fetched ${fallbackReadings.length} latest readings using fallback query for user ${user.id}`)

      return {
        success: true,
        data: fallbackReadings,
        count: fallbackReadings.length,
        user_id: user.id
      }
    }

  } catch (error) {
    console.error('Latest readings API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching latest readings'
    })
  }
})