// server/api/apiaries/[id].get.js - Get specific apiary
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    
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
    
    // Get apiary with its hives
    const { data: apiary, error } = await authClient
      .from('apiaries')
      .select(`
        *,
        hives:hives(*)
      `)
      .eq('id', apiaryId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Apiary not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch apiary'
      })
    }

    return { data: apiary }
    
  } catch (error) {
    console.error('Get apiary error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch apiary'
    })
  }
})

// ============================================================================
