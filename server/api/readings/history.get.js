// server/api/readings/history.get.js - Historical readings with authentication
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

    console.log(`Fetching historical readings for user: ${user.id}`)

    // Step 3: Get query parameters
    const query = getQuery(event)
    const { 
      hive_id,
      time_range = '24h',
      limit = 2000
    } = query

    if (!hive_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'hive_id parameter is required'
      })
    }

    // Step 4: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    // First, verify the hive belongs to the user
    const { data: hive, error: hiveError } = await serviceClient
      .from('hives')
      .select('id, name, user_id')
      .eq('id', hive_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (hiveError || !hive) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Hive not found or not owned by user'
      })
    }

    // Calculate time filter based on time_range
    let timeFilter = new Date()
    switch (time_range) {
      case '24h':
        timeFilter.setHours(timeFilter.getHours() - 24)
        break
      case '7d':
        timeFilter.setDate(timeFilter.getDate() - 7)
        break
      case '30d':
        timeFilter.setDate(timeFilter.getDate() - 30)
        break
      default:
        timeFilter.setHours(timeFilter.getHours() - 24)
    }

    console.log(`Fetching readings since: ${timeFilter.toISOString()}`)

    // Get historical readings for the hive
    const { data: readings, error: readingsError } = await serviceClient
      .from('sensor_readings')
      .select(`
        id,
        sensor_id,
        hive_id,
        sensor_type,
        value,
        unit,
        reading_time,
        signal_strength,
        created_at
      `)
      .eq('hive_id', hive_id)
      .gte('reading_time', timeFilter.toISOString())
      .order('reading_time', { ascending: true })
      .limit(parseInt(limit))

    if (readingsError) {
      console.error('Error fetching historical readings:', readingsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch historical readings'
      })
    }

    console.log(`Successfully fetched ${readings?.length || 0} historical readings for hive ${hive_id}`)

    // Group readings by sensor type for easier processing
    const readingsByType = {
      temperature: readings?.filter(r => r.sensor_type === 'temperature') || [],
      humidity: readings?.filter(r => r.sensor_type === 'humidity') || [],
      weight: readings?.filter(r => r.sensor_type === 'weight') || []
    }

    return {
      success: true,
      data: readings || [],
      count: readings?.length || 0,
      hive_id: parseInt(hive_id),
      hive_name: hive.name,
      time_range,
      readings_by_type: readingsByType,
      time_filter: timeFilter.toISOString(),
      user_id: user.id
    }

  } catch (error) {
    console.error('Historical readings API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching historical readings'
    })
  }
})