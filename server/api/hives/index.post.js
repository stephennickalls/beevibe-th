// server/api/hives/index.post.js - Fixed without hardcoded service key
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== CREATE HIVE START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey
    
    if (!supabaseUrl || !anonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    if (!serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase service role key'
      })
    }

    // Step 1: Authenticate user with anon key
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    console.log('Creating hive for user:', user.id)

    // Step 2: Get request body and validate
    const body = await readBody(event)
    
    if (!body.name || !body.name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hive name is required'
      })
    }

    // Step 3: Validate apiary ownership if apiary_id is provided
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    if (body.apiary_id) {
      const { data: apiary, error: apiaryError } = await serviceClient
        .from('apiaries')
        .select('id')
        .eq('id', body.apiary_id)
        .eq('user_id', user.id)
        .single()

      if (apiaryError || !apiary) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only assign hives to your own apiaries'
        })
      }
    }

    // Step 4: Check current usage and limits
    const { count: currentHives } = await serviceClient
      .from('hives')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    console.log('Current hives:', currentHives)

    // Simple limit check - allow up to 10 hives per user
    if (currentHives >= 10) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Hive limit reached. You can have up to 10 hives.'
      })
    }

    // Step 5: Create new hive (updated for apiary structure)
    const newHive = {
      user_id: user.id,
      created_by: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      apiary_id: body.apiary_id || null, // Link to apiary instead of GPS coordinates
      installation_date: body.installation_date || new Date().toISOString().split('T')[0],
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting hive:', newHive)

    // Use service role to insert (bypasses RLS)
    const { data, error } = await serviceClient
      .from('hives')
      .insert([newHive])
      .select(`
        *,
        apiary:apiaries(*)
      `)
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message}`
      })
    }

    console.log('✅ Hive created successfully:', data)
    console.log('=== CREATE HIVE END ===')
    
    return { 
      data,
      subscription_info: {
        plan: 'free',
        hives_used: currentHives + 1,
        hives_limit: 10,
        sensors_used: 0,
        sensors_limit: 30
      }
    }
    
  } catch (error) {
    console.error('Create hive error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create hive'
    })
  }
})