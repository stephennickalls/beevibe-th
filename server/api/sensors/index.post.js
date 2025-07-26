// server/api/sensors/index.post.js - FIXED VERSION
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== CREATE SENSOR START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZHRjbHV4YmdvaGFjb3VudnlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzI1NTY1MCwiZXhwIjoyMDUyODMxNjUwfQ.VVEw8Bob9AjV_WeBsVHLdNKMRUWq2QLeBHAG8o1is7s'
    
    if (!supabaseUrl || !anonKey) {
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

    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    console.log('Creating sensor for user:', user.id)

    // Step 2: Get request body and validate
    const body = await readBody(event)
    
    if (!body.sensor_type || !body.name?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Sensor type and name are required'
      })
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Step 3: FIXED - Only validate hive ownership if hive_id is provided
    if (body.hive_id) {
      console.log('Validating hive ownership for hive_id:', body.hive_id)
      
      const { data: hive, error: hiveError } = await serviceClient
        .from('hives')
        .select('id, user_id')
        .eq('id', body.hive_id)
        .eq('user_id', user.id)
        .single()

      if (hiveError || !hive) {
        console.error('Hive validation error:', hiveError)
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only assign sensors to your own hives'
        })
      }
      
      console.log('✅ Hive validation passed for hive:', hive.id)
    } else {
      console.log('ℹ️  Creating unassigned sensor (no hive_id provided)')
    }

    // Step 4: Check current usage and limits
    const { count: currentSensors } = await serviceClient
      .from('sensors')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log('Current sensor count:', currentSensors)

    // Simple limit check - allow up to 30 sensors per user
    if (currentSensors >= 30) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Sensor limit reached. You can have up to 30 sensors.'
      })
    }

    // FIXED - Only check per-hive limits if assigning to a hive
    if (body.hive_id) {
      const { count: hiveSensorCount } = await serviceClient
        .from('sensors')
        .select('id', { count: 'exact', head: true })
        .eq('hive_id', body.hive_id)

      // Allow up to 10 sensors per hive
      if (hiveSensorCount >= 10) {
        throw createError({
          statusCode: 403,
          statusMessage: 'This hive already has the maximum of 10 sensors.'
        })
      }
      
      console.log(`✅ Hive ${body.hive_id} has ${hiveSensorCount}/10 sensors`)
    }

    // Step 5: Create new sensor - FIXED to handle null hive_id
    const newSensor = {
      user_id: user.id,
      hive_id: body.hive_id || null, // Explicitly set to null if not provided
      sensor_type: body.sensor_type,
      name: body.name.trim(),
      model: body.model?.trim() || null,
      battery_level: parseInt(body.battery_level) || 100,
      is_online: body.is_online !== undefined ? body.is_online : true,
      calibration_offset: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting sensor:', {
      ...newSensor,
      hive_assignment: newSensor.hive_id ? `Assigned to hive ${newSensor.hive_id}` : 'Unassigned'
    })

    // Use service role to insert (bypasses RLS)
    const { data, error } = await serviceClient
      .from('sensors')
      .insert([newSensor])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message}`
      })
    }

    console.log('✅ Sensor created successfully:', {
      id: data.id,
      name: data.name,
      type: data.sensor_type,
      hive_id: data.hive_id || 'unassigned'
    })
    console.log('=== CREATE SENSOR END ===')
    
    return { 
      data,
      subscription_info: {
        plan: 'free',
        sensors_used: currentSensors + 1,
        sensors_limit: 30,
        sensors_per_hive_limit: 10
      }
    }
    
  } catch (error) {
    console.error('Create sensor error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create sensor'
    })
  }
})