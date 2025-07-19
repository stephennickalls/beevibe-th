// server/api/readings/index.post.js - Create reading (for sensors)
export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseClient(event)
  
  try {
    // Get authenticated user (could be a sensor device or admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const body = await readBody(event)
    
    // Validate required fields
    if (!body.sensor_id || !body.hive_id || !body.sensor_type || body.value === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'sensor_id, hive_id, sensor_type, and value are required'
      })
    }

    // Verify the sensor and hive belong to the user
    const { data: sensor, error: sensorError } = await supabase
      .from('sensors')
      .select(`
        id,
        user_id,
        hives (
          id,
          user_id
        )
      `)
      .eq('id', body.sensor_id)
      .single()

    if (sensorError || !sensor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor not found'
      })
    }

    // For API readings, we might allow system/admin users to post readings
    // But for user-created readings, verify ownership
    if (sensor.user_id !== user.id && sensor.hives?.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied to this sensor'
      })
    }

    // Verify hive ownership separately
    const { data: hive, error: hiveError } = await supabase
      .from('hives')
      .select('id, user_id')
      .eq('id', body.hive_id)
      .single()

    if (hiveError || !hive || hive.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied to this hive'
      })
    }

    // Validate sensor belongs to the specified hive
    if (sensor.hive_id && sensor.hive_id !== parseInt(body.hive_id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Sensor is not assigned to the specified hive'
      })
    }

    // Validate value is a number
    const numericValue = parseFloat(body.value)
    if (isNaN(numericValue)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reading value must be a valid number'
      })
    }

    // Create new reading
    const newReading = {
      sensor_id: parseInt(body.sensor_id),
      hive_id: parseInt(body.hive_id),
      sensor_type: body.sensor_type.trim(),
      value: numericValue,
      unit: body.unit?.trim() || '',
      reading_time: body.reading_time ? new Date(body.reading_time).toISOString() : new Date().toISOString(),
      signal_strength: body.signal_strength ? parseInt(body.signal_strength) : null
    }

    // Validate reading_time is a valid date
    if (isNaN(new Date(newReading.reading_time).getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid reading_time format'
      })
    }

    const { data, error } = await supabase
      .from('sensor_readings')
      .insert([newReading])
      .select()
      .single()

    if (error) {
      console.error('Database error creating reading:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save sensor reading'
      })
    }

    // Update sensor's last_reading_at timestamp
    await supabase
      .from('sensors')
      .update({ 
        last_reading_at: newReading.reading_time,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.sensor_id)

    return { 
      data,
      message: 'Sensor reading created successfully'
    }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Reading creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create reading'
    })
  }
})

