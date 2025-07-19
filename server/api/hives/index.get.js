// server/api/hives/index.get.js - GET all hives for user
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

    // Get only user's hives with sensor counts
    const { data: hives, error } = await supabase
      .from('hives')
      .select(`
        *,
        sensors (
          id,
          sensor_type,
          name,
          is_online,
          last_reading_at,
          battery_level
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Add sensor counts to each hive
    const hivesWithCounts = hives.map(hive => ({
      ...hive,
      sensor_count: hive.sensors?.length || 0,
      sensors: hive.sensors || []
    }))

    return { data: hivesWithCounts }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Hives fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch hives'
    })
  }
})

