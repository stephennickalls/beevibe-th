// server/api/apiaries/[id].put.js - Update apiary with improved debugging
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== UPDATE APIARY START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Config check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceRoleKey
    })
    
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }
    
    // Get apiary ID from route
    const apiaryId = getRouterParam(event, 'id')
    console.log('Apiary ID from route:', apiaryId, 'Type:', typeof apiaryId)
    
    if (!apiaryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Apiary ID is required'
      })
    }

    // Parse as integer to ensure proper comparison
    const parsedApiaryId = parseInt(apiaryId, 10)
    console.log('Parsed apiary ID:', parsedApiaryId)
    
    if (isNaN(parsedApiaryId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid apiary ID format'
      })
    }
    
    // Authenticate user
    const authHeader = getHeader(event, 'authorization')
    console.log('Auth header exists:', !!authHeader)
    
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    console.log('Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Get request body
    const body = await readBody(event)
    console.log('Request body:', body)

    // Verify ownership using service client for more reliable access
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    console.log('Checking apiary ownership...')
    
    // First, let's check if the apiary exists at all
    const { data: allApiaries, error: allApiariesError } = await serviceClient
      .from('apiaries')
      .select('id, name, user_id')
      .eq('user_id', user.id)

    console.log('User\'s apiaries:', allApiaries)
    console.log('All apiaries error:', allApiariesError?.message)

    // Now specifically check for the requested apiary
    const { data: existing, error: checkError } = await serviceClient
      .from('apiaries')
      .select('id, name, user_id, created_at, updated_at')
      .eq('id', parsedApiaryId)
      .single()

    console.log('Apiary lookup result:', {
      existing,
      checkError: checkError?.message,
      checkErrorCode: checkError?.code
    })

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('Apiary not found in database')
        throw createError({
          statusCode: 404,
          statusMessage: `Apiary with ID ${parsedApiaryId} not found`
        })
      }
      console.error('Database error during ownership check:', checkError)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${checkError.message}`
      })
    }

    if (!existing) {
      console.log('No apiary returned from query')
      throw createError({
        statusCode: 404,
        statusMessage: 'Apiary not found'
      })
    }

    // Check ownership
    console.log('Ownership check:', {
      apiaryUserId: existing.user_id,
      requestUserId: user.id,
      matches: existing.user_id === user.id
    })

    if (existing.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to edit this apiary'
      })
    }

    // Prepare update data
    const updateData = {
      name: body.name?.trim(),
      description: body.description?.trim() || null,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      address: body.address?.trim() || null,
      installation_date: body.installation_date,
      is_active: body.is_active,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    console.log('Final update data:', updateData)

    // Perform the update
    const { data, error } = await serviceClient
      .from('apiaries')
      .update(updateData)
      .eq('id', parsedApiaryId)
      .eq('user_id', user.id) // Double-check ownership
      .select()
      .single()

    console.log('Update result:', {
      data,
      error: error?.message
    })

    if (error) {
      console.error('Update failed:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update apiary: ${error.message}`
      })
    }

    if (!data) {
      console.log('No data returned from update - possible ownership issue')
      throw createError({
        statusCode: 404,
        statusMessage: 'Apiary not found or you do not have permission to edit it'
      })
    }

    console.log('✅ Apiary updated successfully:', data)
    console.log('=== UPDATE APIARY END ===')

    return { 
      success: true,
      data 
    }
    
  } catch (error) {
    console.error('Update apiary error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update apiary'
    })
  }
})