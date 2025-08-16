// server/api/sensor-nodes/index.post.js
// POST /api/sensor-nodes - Create new sensor node

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

    // Step 3: Get request body
    const body = await readBody(event)
    const { hive_id, hub_id, name, description } = body

    // Validate required fields
    if (!hive_id || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'hive_id and name are required'
      })
    }

    console.log(`Creating sensor node for user: ${user.id}, hive: ${hive_id}`)

    // Step 4: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Validate the hive belongs to the user
    const { data: hive, error: hiveError } = await serviceClient
      .from('hives')
      .select('id, user_id')
      .eq('id', hive_id)
      .eq('user_id', user.id)
      .single()

    if (hiveError || !hive) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only create sensor nodes for your own hives'
      })
    }

    // Check if the hive already has a sensor node (1:1 constraint)
    const { count: existingNodes } = await serviceClient
      .from('sensor_nodes')
      .select('id', { count: 'exact', head: true })
      .eq('hive_id', hive_id)

    if (existingNodes > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'This hive already has a sensor node assigned'
      })
    }

    // Create the sensor node
    const { data: newNode, error: insertError } = await serviceClient
      .from('sensor_nodes')
      .insert({
        hive_id,
        hub_id,
        name,
        description,
        user_id: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating sensor node:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create sensor node'
      })
    }

    console.log(`Successfully created sensor node ${newNode.id} for user ${user.id}`)

    return {
      success: true,
      data: newNode
    }

  } catch (error) {
    console.error('Sensor node creation API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while creating sensor node'
    })
  }
})