// server/api/apiaries/[id].put.js - Update apiary
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    
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

    const apiaryId = getRouterParam(event, 'id')
    const body = await readBody(event)

    // Verify ownership
    const { data: existing, error: checkError } = await authClient
      .from('apiaries')
      .select('id')
      .eq('id', apiaryId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Apiary not found'
      })
    }

    // Update apiary
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
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

    const { data, error } = await serviceClient
      .from('apiaries')
      .update(updateData)
      .eq('id', apiaryId)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update apiary: ${error.message}`
      })
    }

    return { data }
    
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

// ============================================================================