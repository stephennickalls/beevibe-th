// server/api/sensors/index.get.js - GET all sensors for user
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

    // Get only user's sensors
    const { data: sensors, error } = await supabase
      .from('sensors')
      .select(`
        *,
        hives (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: sensors }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Sensors fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch sensors'
    })
  }
})