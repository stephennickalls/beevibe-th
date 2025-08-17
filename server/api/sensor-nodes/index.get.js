// server/api/sensor-nodes/index.get.js
// GET /api/sensor-nodes - List sensor nodes with optional filtering

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

    console.log(`Fetching sensor nodes for user: ${user.id}`)

    // Step 3: Get query parameters for optional filtering
    const query = getQuery(event)

    // Step 4: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    let dbQuery = serviceClient
      .from('sensor_nodes')
      .select(`
        id,
        uuid,
        hive_id,
        hub_id,
        name,
        description,
        user_id,
        last_seen,
        firmware_version,
        created_at,
        updated_at,
        hive:hives (
          id,
          uuid,
          name
        ),
        hub:apiary_hubs (
          id,
          uuid,
          name,
          last_seen
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Optional filtering by apiary_id (can be either UUID or numeric ID)
    if (query.apiary_id) {
      // First get the apiary to find associated hive IDs
      let apiaryQuery = serviceClient
        .from('apiaries')
        .select('id')
        .eq('user_id', user.id)
      
      // Check if apiary_id looks like a UUID or numeric ID
      if (query.apiary_id.includes('-')) {
        apiaryQuery = apiaryQuery.eq('uuid', query.apiary_id)
      } else {
        apiaryQuery = apiaryQuery.eq('id', parseInt(query.apiary_id))
      }
      
      const { data: apiary, error: apiaryError } = await apiaryQuery.single()
      
      if (!apiaryError && apiary) {
        // Get hive IDs for this apiary
        const { data: hives } = await serviceClient
          .from('hives')
          .select('id')
          .eq('apiary_id', apiary.id)
          .eq('user_id', user.id)
        
        if (hives && hives.length > 0) {
          const hiveIds = hives.map(h => h.id)
          // Use .is() for NULL check and .in() for specific hive IDs
          dbQuery = dbQuery.or(`hive_id.in.(${hiveIds.join(',')}),hive_id.is.null`)
        } else {
          // No hives in this apiary, return only unassigned nodes
          dbQuery = dbQuery.is('hive_id', null)
        }
      } else {
        // Apiary not found, return empty result
        return {
          success: true,
          data: [],
          count: 0,
          user_id: user.id
        }
      }
    }

    // Optional filtering by hive_id - handle special case for unassigned
    if (query.hive_id) {
      if (query.hive_id === 'unassigned' || query.hive_id === 'null') {
        dbQuery = dbQuery.is('hive_id', null)
      } else {
        dbQuery = dbQuery.eq('hive_id', parseInt(query.hive_id))
      }
    }

    // Optional filtering by hub_id
    if (query.hub_id) {
      if (query.hub_id === 'unassigned' || query.hub_id === 'null') {
        dbQuery = dbQuery.is('hub_id', null)
      } else {
        dbQuery = dbQuery.eq('hub_id', parseInt(query.hub_id))
      }
    }

    const { data: sensorNodes, error: queryError } = await dbQuery

    if (queryError) {
      console.error('Database query error:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch sensor nodes from database'
      })
    }

    // Process the data to add assignment status
    const processedNodes = (sensorNodes || []).map(node => ({
      ...node,
      assignment_status: node.hive_id ? 'assigned' : 'unassigned',
      hub_connection_status: node.hub_id ? 'connected' : 'unconnected',
      // Add battery level from telemetry if available
      battery_level: null, // Will be populated by separate telemetry query
      signal_strength: null // Will be populated by separate telemetry query
    }))

    // Get telemetry data for nodes if any exist
    if (processedNodes.length > 0) {
      const nodeIds = processedNodes.map(n => n.id)
      const { data: telemetryData } = await serviceClient
        .from('device_telemetry')
        .select('device_id, battery_level, rssi, recorded_at')
        .eq('device_type', 'UNIT')
        .in('device_id', nodeIds)
        .order('recorded_at', { ascending: false })

      // Create a map of latest telemetry per node
      const telemetryMap = {}
      telemetryData?.forEach(t => {
        if (!telemetryMap[t.device_id]) {
          telemetryMap[t.device_id] = t
        }
      })

      // Merge telemetry data with nodes
      processedNodes.forEach(node => {
        const telemetry = telemetryMap[node.id]
        if (telemetry) {
          node.battery_level = telemetry.battery_level
          node.signal_strength = telemetry.rssi
          node.last_telemetry_at = telemetry.recorded_at
        }
      })
    }

    console.log(`Successfully fetched ${processedNodes?.length || 0} sensor nodes for user ${user.id}`)

    return {
      success: true,
      data: processedNodes,
      count: processedNodes?.length || 0,
      user_id: user.id
    }

  } catch (error) {
    console.error('Sensor nodes API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching sensor nodes'
    })
  }
})