// server/api/sensor-nodes/[id].delete.js
// DELETE /api/sensor-nodes/:id - Delete sensor node

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

    console.log(`Deleting sensor node ${sensorNodeId} for user: ${user.id}`)

    // Step 4: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Validate the sensor node belongs to the user
    const { data: existingNode, error: fetchError } = await serviceClient
      .from('sensor_nodes')
      .select('id, user_id')
      .eq('id', sensorNodeId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingNode) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor node not found or access denied'
      })
    }

    // First, update all sensors to remove sensor_node_id reference
    const { error: sensorsError } = await serviceClient
      .from('sensors')
      .update({ sensor_node_id: null })
      .eq('sensor_node_id', sensorNodeId)

    if (sensorsError) {
      console.error('Error updating sensors:', sensorsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to unlink sensors from sensor node'
      })
    }

    // Then delete the sensor node
    const { error: deleteError } = await serviceClient
      .from('sensor_nodes')
      .delete()
      .eq('id', sensorNodeId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting sensor node:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete sensor node'
      })
    }

    console.log(`Successfully deleted sensor node ${sensorNodeId} for user ${user.id}`)

    return {
      success: true,
      message: 'Sensor node deleted successfully'
    }

  } catch (error) {
    console.error('Sensor node delete API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while deleting sensor node'
    })
  }
})