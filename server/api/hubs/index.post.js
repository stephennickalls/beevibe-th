// server/api/hubs/index.post.js - Fixed to match working sensors pattern exactly
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== CREATE HUB START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    // Step 1: Authenticate user
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

    console.log('Creating hub for user:', user.id)

    // Step 2: Get request body and validate
    const body = await readBody(event)
    
    if (!body.name?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hub name is required'
      })
    }

    if (body.name.trim().length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hub name must be at least 2 characters long'
      })
    }

    if (body.name.trim().length > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hub name must be less than 100 characters'
      })
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Step 3: Validate apiary ownership if apiary_id is provided
    if (body.apiary_id) {
      console.log('Validating apiary ownership for apiary_id:', body.apiary_id)
      
      const { data: apiary, error: apiaryError } = await serviceClient
        .from('apiaries')
        .select('id, user_id')
        .eq('id', body.apiary_id)
        .eq('user_id', user.id)
        .single()

      if (apiaryError || !apiary) {
        console.error('Apiary validation error:', apiaryError)
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only assign hubs to your own apiaries'
        })
      }
      
      console.log('✅ Apiary validation passed for apiary:', apiary.id)
    } else {
      console.log('ℹ️  Creating unassigned hub (no apiary_id provided)')
    }

    // Step 4: Check current usage and limits
    const { count: currentHubs } = await serviceClient
      .from('apiary_hubs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log('Current hub count:', currentHubs)

    // Simple limit check - allow up to 5 hubs per user
    if (currentHubs >= 5) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Hub limit reached. You can have up to 5 hubs.'
      })
    }

    // Step 5: Create new hub (matching sensors pattern exactly)
    const newHub = {
      user_id: user.id,
      apiary_id: body.apiary_id || null,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting hub:', {
      ...newHub,
      apiary_assignment: newHub.apiary_id ? `Assigned to apiary ${newHub.apiary_id}` : 'Unassigned'
    })

    // Use service role to insert (bypasses RLS)
    const { data, error } = await serviceClient
      .from('apiary_hubs')
      .insert([newHub])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message}`
      })
    }

    console.log('✅ Hub created successfully:', {
      id: data.id,
      name: data.name,
      uuid: data.uuid,
      apiary_id: data.apiary_id
    })
    console.log('=== CREATE HUB END ===')
    
    return { 
      data,
      subscription_info: {
        plan: 'free',
        hubs_used: currentHubs + 1,
        hubs_limit: 5
      }
    }
    
  } catch (error) {
    console.error('Create hub error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create hub'
    })
  }
})