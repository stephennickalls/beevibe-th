// server/api/hives/index.post.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Create service role client for admin operations
  const supabaseAdmin = createClient(
    config.public.supabaseUrl, 
    config.supabaseAnonKey // This should be service role key for admin operations
  )

  // Create user client for authentication
  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    // Get authenticated user from request
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      })
    }

    // Set the auth header for the supabase client
    supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
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

    // Check user's subscription and limits
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        status,
        plan:subscription_plans(
          name,
          limits
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No active subscription found. Please subscribe to create hives.'
      })
    }

    // Count user's current hives
    const { count: currentHiveCount, error: countError } = await supabaseAdmin
      .from('hives')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (countError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error checking hive count'
      })
    }

    // Check if user has reached their hive limit
    const maxHives = subscription.plan?.limits?.max_hives || 0
    
    if (maxHives !== -1 && currentHiveCount >= maxHives) {
      throw createError({
        statusCode: 403,
        statusMessage: `Hive limit reached for ${subscription.plan?.name} plan (${maxHives} hives). Please upgrade your plan to add more hives.`
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

    // Insert into database using service role for RLS bypass during creation
    const { data, error } = await supabaseAdmin
      .from('hives')
      .insert([newHive])
      .select()
      .single()

    if (error) throw error
    
    return { 
      data,
      subscription_info: {
        plan: subscription.plan?.name,
        hives_used: currentHiveCount + 1,
        hives_limit: maxHives
      }
    }
    
  } catch (error) {
    // Handle known errors
    if (error.statusCode) {
      throw error
    }
    
    // Handle unexpected errors
    console.error('Hive creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create hive'
    })
  }
})