// server/api/readings/index.get.js - Secure readings access
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

    const query = getQuery(event)
    const { hive_id, sensor_id, limit = 100, offset = 0 } = query

    // Build query - only access user's data
    let queryBuilder = supabase
      .from('sensor_readings')
      .select(`
        *,
        sensors (
          id,
          name,
          sensor_type,
          hives (
            id,
            name,
            user_id
          )
        )
      `)
      .order('reading_time', { ascending: false })
      .limit(limit)
      .offset(offset)

    // Filter by hive_id if provided (and verify ownership)
    if (hive_id) {
      const { data: hive, error: hiveError } = await supabase
        .from('hives')
        .select('id')
        .eq('id', hive_id)
        .eq('user_id', user.id)
        .single()

      if (hiveError || !hive) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied to this hive'
        })
      }

      queryBuilder = queryBuilder.eq('hive_id', hive_id)
    }

    // Filter by sensor_id if provided (and verify ownership)
    if (sensor_id) {
      const { data: sensor, error: sensorError } = await supabase
        .from('sensors')
        .select('id, user_id')
        .eq('id', sensor_id)
        .eq('user_id', user.id)
        .single()

      if (sensorError || !sensor) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied to this sensor'
        })
      }

      queryBuilder = queryBuilder.eq('sensor_id', sensor_id)
    }

    // If no specific filters, get readings from user's hives only
    if (!hive_id && !sensor_id) {
      const { data: userHives } = await supabase
        .from('hives')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)

      const hiveIds = userHives?.map(h => h.id) || []
      
      if (hiveIds.length === 0) {
        return { data: [], count: 0 }
      }

      queryBuilder = queryBuilder.in('hive_id', hiveIds)
    }

    const { data: readings, error } = await queryBuilder

    if (error) throw error

    // Filter out readings from sensors not owned by user (extra security)
    const filteredReadings = readings.filter(reading => 
      reading.sensors?.hives?.user_id === user.id
    )

    return { data: filteredReadings }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Readings fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch readings'
    })
  }
})

