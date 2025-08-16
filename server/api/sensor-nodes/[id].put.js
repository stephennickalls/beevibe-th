// server/api/sensor-nodes/[id].put.js
// PUT /api/sensor-nodes/:id - Update sensor node

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

    // Step 3: Get sensor node ID and request body
    const sensorNodeId = getRouterParam(event, 'id')
    const body = await readBody(event)

    console.log(`Updating sensor node ${sensorNodeId} for user: ${user.id}`)

    // Step 4: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Validate the sensor node belongs to the user
    const { data: existingNode, error: fetchError } = await serviceClient
      .from('sensor_nodes')
      .select('id, user_id, hive_id')
      .eq('id', sensorNodeId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingNode) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor node not found or access denied'
      })
    }

    // If assigning to a hive, validate the hive belongs to the user
    if (body.hive_id && body.hive_id !== existingNode.hive_id) {
      const { data: hive, error: hiveError } = await serviceClient
        .from('hives')
        .select('id, user_id')
        .eq('id', body.hive_id)
        .eq('user_id', user.id)
        .single()

      if (hiveError || !hive) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only assign sensor nodes to your own hives'
        })
      }

      // Check if the hive already has a sensor node (1:1 constraint)
      const { count: existingNodes } = await serviceClient
        .from('sensor_nodes')
        .select('id', { count: 'exact', head: true })
        .eq('hive_id', body.hive_id)
        .neq('id', sensorNodeId)

      if (existingNodes > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'This hive already has a sensor node assigned'
        })
      }
    }

    // Update the sensor node
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data: updatedNode, error: updateError } = await serviceClient
      .from('sensor_nodes')
      .update(updateData)
      .eq('id', sensorNodeId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating sensor node:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update sensor node'
      })
    }

    console.log(`Successfully updated sensor node ${sensorNodeId} for user ${user.id}`)

    return {
      success: true,
      data: updatedNode
    }

  } catch (error) {
    console.error('Sensor node update API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while updating sensor node'
    })
  }
})