// server/api/apiaries/index.post.js - Create new apiary
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
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

    // Authenticate user
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Get and validate request body
    const body = await readBody(event)
    
    if (!body.name || !body.name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Apiary name is required'
      })
    }

    // Create new apiary
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    const newApiary = {
      user_id: user.id,
      created_by: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      address: body.address?.trim() || null,
      installation_date: body.installation_date || new Date().toISOString().split('T')[0],
      is_active: body.is_active !== undefined ? body.is_active : true
    }

    const { data, error } = await serviceClient
      .from('apiaries')
      .insert([newApiary])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message}`
      })
    }

    return { data }
    
  } catch (error) {
    console.error('Create apiary error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create apiary'
    })
  }
})

// ============================================================================
