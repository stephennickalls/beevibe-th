// server/api/apiaries/[id].delete.js - Delete apiary
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

    // Check if apiary has hives
    const { data: hives, error: hivesError } = await authClient
      .from('hives')
      .select('id')
      .eq('apiary_id', apiaryId)
      .eq('user_id', user.id)

    if (hivesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check apiary hives'
      })
    }

    if (hives && hives.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete apiary that contains hives. Please move or delete the hives first.'
      })
    }

    // Verify ownership and delete
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    const { error } = await serviceClient
      .from('apiaries')
      .delete()
      .eq('id', apiaryId)
      .eq('user_id', user.id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete apiary: ${error.message}`
      })
    }

    return { success: true }
    
  } catch (error) {
    console.error('Delete apiary error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete apiary'
    })
  }
})