
// server/api/hives/[id].get.js - Get individual hive details (NEW FILE)
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== GET HIVE DETAILS START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey
    
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    // Step 1: Authenticate user
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

    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    // Step 2: Get hive identifier from route params
    const hiveIdentifier = getRouterParam(event, 'id')
    if (!hiveIdentifier) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hive identifier is required'
      })
    }

    console.log('Fetching hive:', hiveIdentifier, 'for user:', user.id)

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Step 3: Determine if identifier is UUID or ID and query accordingly
    let query = serviceClient
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
          uuid,
          name,
          description,
          latitude,
          longitude,
          address
        ),
        sensors!sensors_hive_id_fkey(
          id,
          uuid,
          name,
          sensor_type,
          is_active,
          last_reading_at
        )
      `)
      .eq('user_id', user.id)
      .single()

    // Check if identifier looks like a UUID (contains hyphens) or is numeric
    if (hiveIdentifier.includes('-')) {
      // Looks like UUID
      query = query.eq('uuid', hiveIdentifier)
    } else {
      // Looks like numeric ID
      query = query.eq('id', parseInt(hiveIdentifier))
    }

    const { data: hive, error: fetchError } = await query

    if (fetchError || !hive) {
      console.error('Hive fetch error:', fetchError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Hive not found'
      })
    }

    // Step 4: Get recent alerts for this hive
    const { data: recentAlerts } = await serviceClient
      .from('alerts')
      .select(`
        id,
        alert_type,
        severity,
        title,
        message,
        resolved,
        created_at
      `)
      .eq('hive_id', hive.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Step 5: Get latest sensor readings
    const { data: latestReadings } = await serviceClient
      .from('sensor_readings')
      .select(`
        id,
        sensor_id,
        temperature,
        humidity,
        weight,
        sound_level,
        vibration,
        created_at,
        sensors!sensor_readings_sensor_id_fkey(
          name,
          sensor_type
        )
      `)
      .eq('hive_id', hive.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Combine all data
    const enrichedHive = {
      ...hive,
      recent_alerts: recentAlerts || [],
      latest_readings: latestReadings || [],
      sensor_count: hive.sensors?.length || 0,
      active_sensor_count: hive.sensors?.filter(s => s.is_active)?.length || 0
    }

    console.log('✅ Hive details fetched successfully')
    console.log('=== GET HIVE DETAILS END ===')
    
    return { 
      success: true,
      data: enrichedHive
    }
    
  } catch (error) {
    console.error('Get hive details error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch hive details'
    })
  }
})

