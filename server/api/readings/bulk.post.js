// server/api/readings/bulk.post.js - Create multiple readings at once
export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseClient(event)
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const body = await readBody(event)
    
    // Validate readings array
    if (!Array.isArray(body.readings) || body.readings.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'readings array is required and cannot be empty'
      })
    }

    if (body.readings.length > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum 100 readings allowed per bulk request'
      })
    }

    // Validate each reading
    const validatedReadings = []
    const sensorIds = new Set()
    const hiveIds = new Set()

    for (let i = 0; i < body.readings.length; i++) {
      const reading = body.readings[i]
      
      if (!reading.sensor_id || !reading.hive_id || !reading.sensor_type || reading.value === undefined) {
        throw createError({
          statusCode: 400,
          statusMessage: `Reading ${i + 1}: sensor_id, hive_id, sensor_type, and value are required`
        })
      }

      const numericValue = parseFloat(reading.value)
      if (isNaN(numericValue)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Reading ${i + 1}: value must be a valid number`
        })
      }

      sensorIds.add(parseInt(reading.sensor_id))
      hiveIds.add(parseInt(reading.hive_id))

      validatedReadings.push({
        sensor_id: parseInt(reading.sensor_id),
        hive_id: parseInt(reading.hive_id),
        sensor_type: reading.sensor_type.trim(),
        value: numericValue,
        unit: reading.unit?.trim() || '',
        reading_time: reading.reading_time ? new Date(reading.reading_time).toISOString() : new Date().toISOString(),
        signal_strength: reading.signal_strength ? parseInt(reading.signal_strength) : null
      })
    }

    // Verify user owns all sensors
    const { data: userSensors, error: sensorsError } = await supabase
      .from('sensors')
      .select('id, user_id, hive_id')
      .in('id', Array.from(sensorIds))

    if (sensorsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify sensor ownership'
      })
    }

    for (const sensorId of sensorIds) {
      const sensor = userSensors.find(s => s.id === sensorId)
      if (!sensor || sensor.user_id !== user.id) {
        throw createError({
          statusCode: 403,
          statusMessage: `Access denied to sensor ${sensorId}`
        })
      }
    }

    // Verify user owns all hives
    const { data: userHives, error: hivesError } = await supabase
      .from('hives')
      .select('id, user_id')
      .in('id', Array.from(hiveIds))

    if (hivesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify hive ownership'
      })
    }

    for (const hiveId of hiveIds) {
      const hive = userHives.find(h => h.id === hiveId)
      if (!hive || hive.user_id !== user.id) {
        throw createError({
          statusCode: 403,
          statusMessage: `Access denied to hive ${hiveId}`
        })
      }
    }

    // Insert all readings
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert(validatedReadings)
      .select()

    if (error) {
      console.error('Database error creating bulk readings:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save sensor readings'
      })
    }

    // Update last_reading_at for all affected sensors
    const updatePromises = Array.from(sensorIds).map(sensorId => {
      const sensorReadings = validatedReadings.filter(r => r.sensor_id === sensorId)
      const latestReading = sensorReadings.reduce((latest, current) => 
        new Date(current.reading_time) > new Date(latest.reading_time) ? current : latest
      )

      return supabase
        .from('sensors')
        .update({ 
          last_reading_at: latestReading.reading_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', sensorId)
    })

    await Promise.all(updatePromises)

    return { 
      data,
      message: `Successfully created ${data.length} sensor readings`,
      count: data.length
    }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Bulk readings creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create bulk readings'
    })
  }
})