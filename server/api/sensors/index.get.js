// server/api/sensors/index.get.js
// GET /api/sensors - List individual sensors (not sensor nodes)

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

    // Step 4: Query database with service role - QUERY SENSORS TABLE NOT SENSOR_NODES
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    let dbQuery = serviceClient
      .from('sensors')  // ✅ CORRECT - Query individual sensors
      .select(`
        *,
        hive:hives!sensors_hive_id_fkey(
          id,
          name,
          apiary_id,
          apiary:apiaries!hives_apiary_id_fkey(id, name)
        ),
        sensor_node:sensor_nodes!sensors_sensor_node_id_fkey(
          id,
          name,
          last_seen
        ),
        latest_reading:sensor_readings(
          value,
          unit,
          reading_time
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (query.apiary_id) {
      // Filter by apiary through the hive relationship
      dbQuery = dbQuery.eq('hive.apiary_id', parseInt(query.apiary_id))
    }

    if (query.hive_id) {
      dbQuery = dbQuery.eq('hive_id', parseInt(query.hive_id))
    }

    if (query.sensor_type) {
      dbQuery = dbQuery.eq('sensor_type', query.sensor_type)
    }

    if (query.unassigned) {
      // Only get sensors not assigned to any hive
      dbQuery = dbQuery.is('hive_id', null)
    }

    const { data: sensors, error: queryError } = await dbQuery

    if (queryError) {
      console.error('Database query error:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch sensors from database'
      })
    }

    // Transform data to include derived properties
    const transformedData = sensors.map(sensor => ({
      ...sensor,
      // Determine online status based on last reading
      is_online: sensor.last_reading_at 
        ? (new Date() - new Date(sensor.last_reading_at)) < (30 * 60 * 1000) // 30 minutes
        : false,
      // Add latest reading value if available
      latest_value: sensor.latest_reading?.[0]?.value || null,
      latest_unit: sensor.latest_reading?.[0]?.unit || null,
      latest_reading_time: sensor.latest_reading?.[0]?.reading_time || null
    }))

    console.log(`Successfully fetched ${transformedData?.length || 0} sensors for user ${user.id}`)

    return {
      success: true,
      data: transformedData || [],
      count: transformedData?.length || 0,
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