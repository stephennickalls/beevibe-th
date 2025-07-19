// server/api/hives/index.post.js - Updated with new subscription limits
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

    // Get request body
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hive name is required'
      })
    }

    // Check subscription limits
    const limitCheck = await checkSubscriptionLimits(event, user.id, 'create_hive')
    
    if (!limitCheck.allowed) {
      throw createError({
        statusCode: 403,
        statusMessage: limitCheck.reason
      })
    }

    // Create new hive object
    const newHive = {
      user_id: user.id,
      created_by: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || body.name.trim(),
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      installation_date: body.installation_date || new Date().toISOString().split('T')[0],
      is_active: body.is_active !== undefined ? body.is_active : true
    }

    // Insert into database
    const { data, error } = await supabase
      .from('hives')
      .insert([newHive])
      .select()
      .single()

    if (error) throw error
    
    return { 
      data,
      subscription_info: {
        plan: limitCheck.plan,
        hives_used: limitCheck.currentUsage.hives + 1,
        hives_limit: limitCheck.limits.max_hives,
        sensors_used: limitCheck.currentUsage.sensors,
        sensors_limit: limitCheck.limits.max_sensors_total
      }
    }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Hive creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create hive'
    })
  }
})

