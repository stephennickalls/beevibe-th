// server/api/hubs/index.get.js - Get all hubs for authenticated user
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== HUBS API GET START ===')
    
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

    // Step 3: Use service role client for database operations
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Step 4: Get hubs with related data
    const { data: hubsData, error: hubsError } = await serviceClient
      .from('apiary_hubs')
      .select(`
        *,
        apiary:apiaries(
          id,
          name,
          description,
          latitude,
          longitude
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (hubsError) {
      console.error('Hubs fetch error:', hubsError)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${hubsError.message}`
      })
    }

    console.log(`Found ${hubsData?.length || 0} hubs for user ${user.id}`)

    // Step 5: Get sensor units count for each hub
    const hubIds = (hubsData || []).map(h => h.id)
    let sensorUnitsData = []
    
    if (hubIds.length > 0) {
      const { data: unitsData, error: unitsError } = await serviceClient
        .from('sensor_nodes')
        .select('hub_id, id')
        .in('hub_id', hubIds)
        .eq('user_id', user.id)
      
      if (!unitsError) {
        sensorUnitsData = unitsData || []
      }
    }

    // Step 6: Get latest telemetry for each hub
    let telemetryData = []
    if (hubIds.length > 0) {
      const { data: tData, error: tError } = await serviceClient
        .from('device_telemetry')
        .select('*')
        .in('device_id', hubIds)
        .eq('device_type', 'HUB')
        .order('recorded_at', { ascending: false })
      
      if (!tError) {
        telemetryData = tData || []
      }
    }

    // Step 7: Get pending commands count
    let pendingCommandsData = []
    if (hubIds.length > 0) {
      const { data: cmdData, error: cmdError } = await serviceClient
        .from('device_commands')
        .select('device_id')
        .in('device_id', hubIds)
        .eq('device_type', 'HUB')
        .in('status', ['queued', 'sent'])
      
      if (!cmdError) {
        pendingCommandsData = cmdData || []
      }
    }

    // Step 8: Combine all data
    const sensorUnitsByHub = {}
    sensorUnitsData.forEach(unit => {
      if (!sensorUnitsByHub[unit.hub_id]) {
        sensorUnitsByHub[unit.hub_id] = 0
      }
      sensorUnitsByHub[unit.hub_id]++
    })

    const telemetryByHub = {}
    telemetryData.forEach(t => {
      if (!telemetryByHub[t.device_id]) {
        telemetryByHub[t.device_id] = t
      }
    })

    const pendingCommandsByHub = {}
    pendingCommandsData.forEach(cmd => {
      pendingCommandsByHub[cmd.device_id] = (pendingCommandsByHub[cmd.device_id] || 0) + 1
    })

    // Step 9: Format response
    const hubs = (hubsData || []).map(hub => ({
      ...hub,
      sensor_nodes_count: sensorUnitsByHub[hub.id] || 0,
      telemetry: telemetryByHub[hub.id] || null,
      pending_commands_count: pendingCommandsByHub[hub.id] || 0
    }))

    console.log(`✅ Returning ${hubs.length} hubs with enhanced data`)

    return {
      success: true,
      data: hubs,
      count: hubs.length
    }

  } catch (error) {
    console.error('Hubs API error:', error)
    
    // Return appropriate error response
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch hubs'
    })
  }
})