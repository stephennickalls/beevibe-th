// server/api/sensors/[id].put.js - Update sensor details
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== UPDATE SENSOR START ===')
    
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

    const sensorId = getRouterParam(event, 'id')
    if (!sensorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Sensor ID is required'
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

    console.log(`Updating sensor ${sensorId} for user ${user.id}`)

    // Step 2: Get request body
    const body = await readBody(event)
    console.log('Update data:', body)

    // Step 3: Validate sensor ownership using service client
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    const { data: existingSensor, error: sensorError } = await serviceClient
      .from('sensors')
      .select('id, name, sensor_type, hive_id, user_id, model, battery_level, is_online')
      .eq('id', sensorId)
      .eq('user_id', user.id)
      .single()

    if (sensorError || !existingSensor) {
      console.error('Sensor validation error:', sensorError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor not found or not owned by user'
      })
    }

    console.log('Existing sensor:', existingSensor)

    // Step 4: Validate hive ownership if hive_id is being changed
    if (body.hive_id && body.hive_id !== existingSensor.hive_id) {
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

      // Check per-hive sensor limits if assigning to a different hive
      const { count: hiveSensorCount } = await serviceClient
        .from('sensors')
        .select('id', { count: 'exact', head: true })
        .eq('hive_id', body.hive_id)
        .neq('id', sensorId) // Exclude current sensor from count

      // Allow up to 10 sensors per hive
      if (hiveSensorCount >= 10) {
        throw createError({
          statusCode: 403,
          statusMessage: 'This hive already has the maximum of 10 sensors.'
        })
      }

      console.log(`✅ Hive ${body.hive_id} has ${hiveSensorCount}/10 sensors (excluding current sensor)`)
    }

    // Step 5: Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    }

    // Only update fields that are provided
    if (body.sensor_type !== undefined) {
      updateData.sensor_type = body.sensor_type
    }
    
    if (body.name !== undefined) {
      updateData.name = body.name.trim() || `${body.sensor_type || existingSensor.sensor_type} Sensor`
    }
    
    if (body.model !== undefined) {
      updateData.model = body.model?.trim() || null
    }
    
    if (body.battery_level !== undefined) {
      updateData.battery_level = parseInt(body.battery_level) || null
    }
    
    if (body.is_online !== undefined) {
      updateData.is_online = Boolean(body.is_online)
    }
    
    if (body.hive_id !== undefined) {
      updateData.hive_id = body.hive_id || null
    }

    console.log('Update data prepared:', updateData)

    // Step 6: Update sensor
    const { data: updatedSensor, error: updateError } = await serviceClient
      .from('sensors')
      .update(updateData)
      .eq('id', sensorId)
      .eq('user_id', user.id)
      .select(`
        id,
        sensor_type,
        name,
        model,
        hive_id,
        user_id,
        is_online,
        battery_level,
        last_reading_at,
        created_at,
        updated_at,
        hives (
          id,
          name
        )
      `)
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update sensor: ${updateError.message}`
      })
    }

    console.log('✅ Sensor updated successfully:', {
      id: updatedSensor.id,
      name: updatedSensor.name,
      type: updatedSensor.sensor_type,
      hive_id: updatedSensor.hive_id || 'unassigned',
      changes: Object.keys(updateData).filter(key => key !== 'updated_at')
    })

    console.log('=== UPDATE SENSOR END ===')

    return { 
      data: updatedSensor,
      message: `Sensor "${updatedSensor.name}" updated successfully`
    }
    
  } catch (error) {
    console.error('Update sensor error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update sensor'
    })
  }
})