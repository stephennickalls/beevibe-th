// server/api/hubs/[id].get.js - Get a single hub by UUID or ID
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== HUB DETAILS API START ===')
    
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

    // Step 1: Authenticate user
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    // Step 2: Verify token and get user
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    console.log(`✅ Authenticated user: ${user.id} (${user.email})`)

    // Step 3: Get hub identifier from route params
    const hubIdentifier = getRouterParam(event, 'id')
    if (!hubIdentifier) {
      console.error('No hub identifier in route params')
      throw createError({
        statusCode: 400,
        statusMessage: 'Hub identifier is required'
      })
    }

    console.log('Fetching hub:', hubIdentifier, 'for user:', user.id)

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Step 4: Determine if identifier is UUID or ID and query accordingly
    let query = serviceClient
      .from('apiary_hubs')
      .select(`
        id,
        uuid,
        name,
        description,
        apiary_id,
        firmware_version,
        last_seen,
        created_at,
        updated_at,
        user_id,
        apiary:apiaries(
          id,
          uuid,
          name,
          description,
          latitude,
          longitude,
          address
        )
      `)
      .eq('user_id', user.id)  // ← CRITICAL: Filter by user first
      .single()

    // Check if identifier looks like a UUID (contains hyphens) or is numeric
    if (hubIdentifier.includes('-')) {
      // Looks like UUID
      console.log('Using UUID lookup for:', hubIdentifier)
      query = query.eq('uuid', hubIdentifier)
    } else {
      // Looks like numeric ID
      console.log('Using ID lookup for:', hubIdentifier)
      query = query.eq('id', parseInt(hubIdentifier))
    }

    const { data: hub, error: fetchError } = await query

    if (fetchError) {
      console.error('Hub fetch error:', fetchError)
      if (fetchError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Hub not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch hub: ${fetchError.message}`
      })
    }

    if (!hub) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Hub not found'
      })
    }

    console.log('Hub found:', hub.name)

    // Step 5: Get sensor units for this hub
    const { data: sensorUnits, error: sensorUnitsError } = await serviceClient
      .from('sensor_units')
      .select(`
        id,
        uuid,
        name,
        description,
        last_seen,
        firmware_version,
        created_at,
        updated_at,
        hive:hives(
          id,
          uuid,
          name
        )
      `)
      .eq('hub_id', hub.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (sensorUnitsError) {
      console.warn('Error fetching sensor units for hub', hub.id, ':', sensorUnitsError)
    }

    // Step 6: Get latest telemetry for this hub
    const { data: telemetry, error: telemetryError } = await serviceClient
      .from('device_telemetry')
      .select('*')
      .eq('device_id', hub.id)
      .eq('device_type', 'HUB')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    if (telemetryError && telemetryError.code !== 'PGRST116') {
      console.warn('Error fetching telemetry for hub', hub.id, ':', telemetryError)
    }

    // Step 7: Get pending commands for this hub
    const { data: pendingCommands, error: commandsError } = await serviceClient
      .from('device_commands')
      .select(`
        id,
        command_type,
        command_data,
        status,
        correlation_id,
        queued_at,
        sent_at,
        acked_at,
        failed_at,
        failure_reason
      `)
      .eq('device_id', hub.id)
      .eq('device_type', 'HUB')
      .in('status', ['queued', 'sent'])
      .order('queued_at', { ascending: false })

    if (commandsError) {
      console.warn('Error fetching commands for hub', hub.id, ':', commandsError)
    }

    // Step 8: Get telemetry history (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: telemetryHistory, error: historyError } = await serviceClient
      .from('device_telemetry')
      .select('*')
      .eq('device_id', hub.id)
      .eq('device_type', 'HUB')
      .gte('recorded_at', twentyFourHoursAgo)
      .order('recorded_at', { ascending: false })

    if (historyError) {
      console.warn('Error fetching telemetry history for hub', hub.id, ':', historyError)
    }

    // Step 9: Combine all data
    const hubWithDetails = {
      ...hub,
      sensor_units: sensorUnits || [],
      sensor_units_count: (sensorUnits || []).length,
      telemetry: telemetry || null,
      pending_commands: pendingCommands || [],
      pending_commands_count: (pendingCommands || []).length,
      telemetry_history: telemetryHistory || []
    }

    console.log('Hub details compiled:', {
      id: hub.id,
      uuid: hub.uuid,
      name: hub.name,
      sensor_units_count: hubWithDetails.sensor_units_count,
      pending_commands_count: hubWithDetails.pending_commands_count,
      has_telemetry: !!hubWithDetails.telemetry,
      telemetry_history_count: hubWithDetails.telemetry_history.length
    })

    console.log('=== HUB DETAILS API END ===')

    return {
      success: true,
      data: hubWithDetails,
      debug: {
        user_id: user.id,
        hub_identifier: hubIdentifier,
        hub_id: hub.id,
        hub_uuid: hub.uuid,
        using_service_role: !!serviceRoleKey
      }
    }
    
  } catch (error) {
    console.error('Get hub details error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch hub details'
    })
  }
})