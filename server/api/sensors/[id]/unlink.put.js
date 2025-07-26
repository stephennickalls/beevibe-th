// server/api/sensors/[id]/unlink.put.js - New endpoint to unlink sensor from hive
export default defineEventHandler(async (event) => {
  try {
    console.log('=== UNLINK SENSOR FROM HIVE ===')
    
    const supabase = serverSupabaseClient(event)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const sensorId = getRouterParam(event, 'id')
    
    if (!sensorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Sensor ID is required'
      })
    }

    console.log(`Unlinking sensor ${sensorId} for user ${user.id}`)

    // Verify user owns the sensor
    const { data: sensor, error: sensorError } = await supabase
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

    // Check if sensor is already unlinked
    if (!sensor.hive_id) {
      console.log('Sensor is already unlinked')
      return { 
        data: sensor,
        message: 'Sensor is already unlinked from any hive'
      }
    }

    console.log(`Unlinking sensor "${sensor.name}" from hive ${sensor.hive_id}`)

    // Update sensor to remove hive assignment
    const { data: updatedSensor, error: updateError } = await supabase
      .from('sensors')
      .update({ 
        hive_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sensorId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to unlink sensor: ${updateError.message}`
      })
    }

    console.log('✅ Sensor successfully unlinked:', {
      id: updatedSensor.id,
      name: updatedSensor.name,
      previousHive: sensor.hive_id,
      currentHive: updatedSensor.hive_id
    })

    return { 
      data: updatedSensor,
      message: `Sensor "${sensor.name}" has been unlinked from the hive`
    }
    
  } catch (error) {
    console.error('Unlink sensor error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to unlink sensor from hive'
    })
  }
})