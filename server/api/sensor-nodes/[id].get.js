// server/api/sensor-nodes/[id].get.js
// GET /api/sensor-nodes/:id - Get specific sensor node

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

    // Step 3: Get sensor node ID
    const sensorNodeId = getRouterParam(event, 'id')

    console.log(`Fetching sensor node ${sensorNodeId} for user: ${user.id}`)

    // Step 4: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: sensorNode, error: queryError } = await serviceClient
      .from('sensor_nodes')
      .select(`
        *,
        hive:hives!sensor_nodes_hive_id_fkey(
          id,
          name,
          apiary_id,
          apiary:apiaries!hives_apiary_id_fkey(id, name)
        ),
        hub:apiary_hubs!sensor_nodes_hub_id_fkey(
          id,
          name,
          last_seen
        ),
        sensors(
          id,
          name,
          sensor_type,
          is_online,
          battery_level,
          last_reading_at,
          latest_reading:sensor_readings(value, unit, reading_time)
        )
      `)
      .eq('id', sensorNodeId)
      .eq('user_id', user.id)
      .single()

    if (queryError || !sensorNode) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor node not found'
      })
    }

    console.log(`Successfully fetched sensor node ${sensorNodeId} for user ${user.id}`)

    return {
      success: true,
      data: sensorNode
    }

  } catch (error) {
    console.error('Sensor node detail API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching sensor node'
    })
  }
})