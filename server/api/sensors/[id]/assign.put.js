// server/api/sensors/[id]/assign.put.js - Assign sensor to hive
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

    const sensorId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    // Verify user owns the sensor
    const { data: sensor, error: sensorError } = await supabase
      .from('sensors')
      .select('*')
      .eq('id', sensorId)
      .eq('user_id', user.id)
      .single()

    if (sensorError || !sensor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sensor not found or not owned by user'
      })
    }

    // If assigning to a hive, verify user owns the hive and check limits
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

      // Check per-hive sensor limits
      const subscriptionInfo = await checkUserSubscription(event, user.id)
      const maxSensorsPerHive = subscriptionInfo.limits.max_sensors_per_hive

      if (maxSensorsPerHive !== -1) {
        const { count: hiveSensorCount } = await supabase
          .from('sensors')
          .select('id', { count: 'exact', head: true })
          .eq('hive_id', body.hive_id)

        if (hiveSensorCount >= maxSensorsPerHive) {
          throw createError({
            statusCode: 403,
            statusMessage: `This hive already has the maximum of ${maxSensorsPerHive} sensors allowed on your ${subscriptionInfo.planDisplayName} plan.`
          })
        }
      }
    }

    // Update sensor assignment
    const { data, error } = await supabase
      .from('sensors')
      .update({ 
        hive_id: body.hive_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sensorId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return { data }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Sensor assignment error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to assign sensor'
    })
  }
})