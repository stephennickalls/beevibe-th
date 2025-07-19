// server/api/sensors/index.post.js - Create sensor with limits
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
    
    // Validate required fields
    if (!body.sensor_type || !body.name?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Sensor type and name are required'
      })
    }

    // If hive_id provided, verify user owns the hive
    if (body.hive_id) {
      const { data: hive, error: hiveError } = await supabase
        .from('hives')
        .select('id')
        .eq('id', body.hive_id)
        .eq('user_id', user.id)
        .single()

      if (hiveError || !hive) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only assign sensors to your own hives'
        })
      }
    }

    // Check subscription limits
    const limitCheck = await checkSubscriptionLimits(event, user.id, 'create_sensor', {
      hive_id: body.hive_id
    })
    
    if (!limitCheck.allowed) {
      throw createError({
        statusCode: 403,
        statusMessage: limitCheck.reason
      })
    }

    // Create new sensor
    const newSensor = {
      user_id: user.id,
      hive_id: body.hive_id || null,
      sensor_type: body.sensor_type,
      name: body.name.trim(),
      model: body.model?.trim() || null,
      battery_level: body.battery_level || 100,
      is_online: body.is_online !== undefined ? body.is_online : true,
      calibration_offset: body.calibration_offset || 0
    }

    const { data, error } = await supabase
      .from('sensors')
      .insert([newSensor])
      .select()
      .single()

    if (error) throw error
    
    return { 
      data,
      subscription_info: {
        plan: limitCheck.plan,
        sensors_used: limitCheck.currentUsage.sensors + 1,
        sensors_limit: limitCheck.limits.max_sensors_total,
        sensors_per_hive_limit: limitCheck.limits.max_sensors_per_hive
      }
    }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Sensor creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create sensor'
    })
  }
})



