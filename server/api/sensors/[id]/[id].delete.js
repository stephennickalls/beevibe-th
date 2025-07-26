// server/api/sensors/[id].delete.js - Delete sensor
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== DELETE SENSOR START ===')
    
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

    console.log(`Deleting sensor ${sensorId} for user ${user.id}`)

    // Step 2: Validate sensor ownership and get sensor details
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    const { data: sensor, error: sensorError } = await serviceClient
      .from('sensors')
      .select('id, name, sensor_type, hive_id, user_id')
      .eq('id', sensorId)
      .eq('user_id', user.id)
      .single()

    if (sensorError || !sensor) {
      console.error('Sensor validation error:', sensorError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor not found or not owned by user'
      })
    }

    console.log('Sensor to delete:', {
      id: sensor.id,
      name: sensor.name,
      type: sensor.sensor_type,
      hive_id: sensor.hive_id || 'unassigned'
    })

    // Step 3: Delete related data first (to maintain referential integrity)
    
    // Delete sensor readings
    try {
      const { error: readingsError } = await serviceClient
        .from('sensor_readings')
        .delete()
        .eq('sensor_id', sensorId)

      if (readingsError) {
        console.warn('Could not delete sensor readings:', readingsError.message)
        // Continue with deletion - readings table might not exist or be empty
      } else {
        console.log('✅ Deleted sensor readings')
      }
    } catch (e) {
      console.log('No sensor readings to delete or table does not exist')
    }

    // Delete alerts related to this sensor
    try {
      const { error: alertsError } = await serviceClient
        .from('alerts')
        .delete()
        .eq('sensor_id', sensorId)

      if (alertsError) {
        console.warn('Could not delete sensor alerts:', alertsError.message)
      } else {
        console.log('✅ Deleted sensor alerts')
      }
    } catch (e) {
      console.log('No sensor alerts to delete')
    }

    // Step 4: Delete the sensor itself
    const { error: deleteError } = await serviceClient
      .from('sensors')
      .delete()
      .eq('id', sensorId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete sensor: ${deleteError.message}`
      })
    }

    console.log('✅ Sensor deleted successfully:', {
      id: sensor.id,
      name: sensor.name,
      type: sensor.sensor_type
    })

    console.log('=== DELETE SENSOR END ===')

    return { 
      success: true,
      message: `Sensor "${sensor.name}" has been permanently deleted`,
      deleted_sensor: {
        id: sensor.id,
        name: sensor.name,
        sensor_type: sensor.sensor_type
      }
    }
    
  } catch (error) {
    console.error('Delete sensor error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete sensor'
    })
  }
})